import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const NO_STORE = { 'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate' };
const CONF = `status in ('Hoàn thành','Đang giao')`;

// Báo cáo tháng từ số liệu thật. GET /api/bao-cao?month=YYYY-MM (mặc định tháng hiện tại, giờ VN)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
  const defMonth = nowVN.toISOString().slice(0, 7);
  const month = searchParams.get('month') || defMonth;
  if (!/^\d{4}-\d{2}$/.test(month)) return NextResponse.json({ ok: false, error: 'month dạng YYYY-MM' }, { status: 400 });
  const [y, m] = month.split('-').map(Number);
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);

  if (!hasDb()) return NextResponse.json({ ok: true, month, mode: 'mock', empty: true }, { headers: NO_STORE });

  const range = (mm: string) => sql()`select coalesce(sum(total),0)::int as revenue, coalesce(sum(profit),0)::int as profit,
    count(*)::int as orders from orders
    where to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${mm} and status in ('Hoàn thành','Đang giao')`;
  const [cur, prv] = await Promise.all([range(month), range(prev)]);

  const daily = await sql()`select to_char(created_at at time zone 'Asia/Ho_Chi_Minh','DD')::int as day,
    sum(total)::int as revenue from orders
    where to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${month} and status in ('Hoàn thành','Đang giao')
    group by 1 order by 1`;
  const bySource = await sql()`select coalesce(source,'pos') as source, count(*)::int as orders, sum(total)::int as revenue
    from orders where to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${month} and status in ('Hoàn thành','Đang giao')
    group by 1`;
  const byCat = await sql()`select coalesce(p.category,'Khác') as category, sum(i.qty)::int as qty, sum(i.qty*i.price)::int as revenue
    from order_items i join orders o on o.id = i.order_id left join products p on p.id = i.product_id
    where to_char(o.created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${month} and o.status in ('Hoàn thành','Đang giao')
    group by 1 order by 3 desc`;
  const top = await sql()`select i.product_name as name, sum(i.qty)::int as qty, sum(i.qty*i.price)::int as revenue
    from order_items i join orders o on o.id = i.order_id
    where to_char(o.created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${month} and o.status in ('Hoàn thành','Đang giao')
    group by 1 order by 3 desc limit 8`;
  const debtors = await sql()`select name, phone, debt from customers where debt > 0 order by debt desc limit 10`;
  const debtSum = await sql()`select coalesce(sum(debt),0)::int as t, count(*)::int as c from customers where debt > 0`;
  const pending = await sql()`select code, customer_name, total from orders where status = 'Chờ xác nhận' order by created_at desc limit 20`;
  const cancelled = await sql()`select count(*)::int as c from orders where to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${month} and status = 'Đã hủy'`;
  const low = await sql()`select id::text as id, name, stock from products where stock < 20 order by stock asc limit 10`;
  const saved = await sql()`select month from reports order by month desc limit 12`.catch(() => []);
  const snapshot = await sql()`select data from reports where month = ${month} limit 1`.catch(() => []);

  const c: any = (cur as any)[0];
  const p: any = (prv as any)[0];
  const pct = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 1000) / 10 : a > 0 ? 100 : 0);

  return NextResponse.json({
    ok: true, mode: 'neon', month, prevMonth: prev,
    cur: { ...c, avg: c.orders ? Math.round(c.revenue / c.orders) : 0 },
    prev: { ...p, avg: p.orders ? Math.round(p.revenue / p.orders) : 0 },
    growth: { revenue: pct(c.revenue, p.revenue), orders: pct(c.orders, p.orders), avg: pct(c.orders ? c.revenue / c.orders : 0, p.orders ? p.revenue / p.orders : 0) },
    daily, bySource, byCat, top,
    debt: { total: (debtSum as any)[0].t, count: (debtSum as any)[0].c, debtors },
    pending, cancelled: (cancelled as any)[0].c, lowStock: low,
    savedMonths: (saved as any[]).map((r: any) => r.month),
    snapshot: (snapshot as any[])[0]?.data || null,
  }, { headers: NO_STORE });
}

// Chốt & lưu báo cáo tháng (1 tháng 1 lần) để đối chiếu về sau
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
  const month = b.month || nowVN.toISOString().slice(0, 7);
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Chưa có DATABASE_URL' }, { status: 500 });
  // Tái sử dụng logic GET bằng cách tính gọn lại ở đây
  const q = (mm: string) => sql()`select coalesce(sum(total),0)::int as revenue, coalesce(sum(profit),0)::int as profit, count(*)::int as orders from orders
    where to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${mm} and status in ('Hoàn thành','Đang giao')`;
  const [cur] = (await q(month)) as any[];
  const top = await sql()`select i.product_name as name, sum(i.qty)::int as qty, sum(i.qty*i.price)::int as revenue
    from order_items i join orders o on o.id = i.order_id
    where to_char(o.created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') = ${month} and o.status in ('Hoàn thành','Đang giao')
    group by 1 order by 3 desc limit 8`;
  const debt = await sql()`select coalesce(sum(debt),0)::int as t from customers where debt > 0`;
  const data = { month, closedAt: new Date().toISOString(), revenue: cur.revenue, profit: cur.profit, orders: cur.orders, top, debtTotal: (debt as any)[0].t };
  await sql()`insert into reports (month, data) values (${month},${JSON.stringify(data)}::jsonb)
    on conflict (month) do update set data = excluded.data, created_at = now()`;
  return NextResponse.json({ ok: true, month });
}
