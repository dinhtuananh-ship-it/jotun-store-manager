import { NextResponse } from 'next/server';
import { sql, hasDb, mockOrders } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').toLowerCase();
    const scope = searchParams.get('scope'); // scope=web -> chỉ đơn online của khách, không lẫn đơn admin/POS
    if (!hasDb()) {
      let mock = mockOrders;
      if (scope === 'web') mock = mock.filter((o: any) => String(o.payment || '').includes('COD') || o.status === 'Chờ xác nhận');
      const filtered = q ? mock.filter((o: any) => (o.id + o.customer).toLowerCase().includes(q)) : mock;
      return NextResponse.json({ orders: filtered, mode: 'mock' });
    }
    const rows = await sql()`select code, customer_name as customer, customer_phone, address, total, profit, status, payment, note, source, created_at as date from orders order by created_at desc limit 100`;
    let mapped: any[] = rows.map((r: any) => ({ id: r.code, customer: r.customer, customer_phone: r.customer_phone, address: r.address, items: 0, total: r.total, profit: r.profit, status: r.status, payment: r.payment, note: r.note, source: r.source || (String(r.payment || '').includes('COD') ? 'web' : 'pos'), date: r.date }));
    if (!mapped.length) mapped = mockOrders.map((o: any) => ({ ...o, source: String(o.payment || '').includes('COD') ? 'web' : 'pos' }));
    if (scope === 'web') mapped = mapped.filter((o: any) => o.source === 'web');
    if (q) mapped = mapped.filter((o: any) => (String(o.id) + String(o.customer) + String(o.customer_phone || '') + String(o.note || '')).toLowerCase().includes(q));
    return NextResponse.json({ orders: mapped, mode: 'neon' });
  } catch (e: any) { return NextResponse.json({ orders: mockOrders, mode: 'mock-fallback' }); }
}

function resolveStatus(b: any) {
  if (b.status) return b.status; // web gửi lên "Chờ xác nhận"
  if (b.source === 'web') return 'Chờ xác nhận';
  if (b.payment === 'Công nợ') return 'Đang giao';
  if (b.payment?.includes('COD')) return 'Chờ xác nhận';
  return 'Hoàn thành';
}

// Chỉ giữ user_id khi là UUID thật (login demo admin ENV có id 'env-admin' -> phải bỏ qua, nếu không Postgres báo lỗi uuid và mất đơn)
const isUUID = (v: any) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function POST(req: Request) {
  const b = await req.json();
  const code = 'DH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
  const total = (b.items || []).reduce((s: number, i: any) => s + i.qty * i.price, 0);
  const profit = Math.round(total * 0.23);
  const status = resolveStatus(b);
  const payment = b.payment || (b.source === 'web' ? 'COD - Thanh toán khi nhận hàng' : 'Tiền mặt');
  // Gộp SĐT + địa chỉ web vào note để tra cứu được mà không cần đổi schema
  const note = b.source === 'web'
    ? `SĐT: ${b.customer_phone || ''} | Đ/c: ${b.address || ''} | Ghi chú: ${b.note || ''}`.slice(0, 500)
    : (b.note || '');
  if (!hasDb()) return NextResponse.json({ ok: true, code, total, status, mode: 'mock' });
  try {
    const session = await getSession().catch(() => null);
    const userId = isUUID(session?.id) ? session!.id : null;
    const o = await sql()`insert into orders (code, customer_name, customer_phone, address, total, profit, status, payment, note, source, user_id) values (${code},${b.customer_name || session?.name || 'Khách lẻ'},${b.customer_phone || ''},${b.address || ''},${total},${profit},${status},${payment},${note},${b.source || 'pos'},${userId}) returning id`;
    const oid = (o as any)[0].id;
    for (const it of b.items || []) {
      const pid = isUUID(it.product_id) ? it.product_id : null;
      await sql()`insert into order_items (order_id, product_id, product_name, qty, price) values (${oid},${pid},${it.product_name},${it.qty},${it.price})`;
      if (pid) {
        await sql()`update products set stock = greatest(0, stock - ${it.qty}) where id = ${pid}`;
        // Ghi xuất kho để đối chiếu với Kho (trước đây POS chỉ trừ tồn mà không lưu vết)
        await sql()`insert into stock_moves (product_id, qty, kind, note) values (${pid},${-Math.abs(it.qty)},'export',${'Bán ' + code})`;
      }
    }
    return NextResponse.json({ ok: true, code, status, mode: 'neon' });
  } catch (e: any) { return NextResponse.json({ ok: false, error: 'Không lưu được đơn: ' + e.message }, { status: 500 }); }
}

// Admin xác nhận / hủy đơn web: PATCH { code, status }
export async function PATCH(req: Request) {
  const b = await req.json();
  if (!b.code || !b.status) return NextResponse.json({ ok: false, error: 'Thiếu code/status' }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`update orders set status = ${b.status} where code = ${b.code}`;
  return NextResponse.json({ ok: true });
}
