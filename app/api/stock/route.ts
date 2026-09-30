import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
export const dynamic = 'force-dynamic';

// Lịch sử nhập/xuất kho
export async function GET() {
  if (!hasDb()) return NextResponse.json({ moves: [], mode: 'mock' });
  const rows = await sql()`select m.id::text as id, m.qty, m.kind, m.note, m.created_at, p.name as product_name, p.sku
    from stock_moves m left join products p on p.id = m.product_id order by m.created_at desc limit 50`;
  return NextResponse.json({ moves: rows, mode: 'neon' });
}

// Nhập hàng: POST { product_id, qty, note } -> cộng tồn + ghi stock_moves (đồng bộ với Sản phẩm)
export async function POST(req: Request) {
  const b = await req.json();
  const qty = Number(b.qty || 0);
  if (!b.product_id || !qty) return NextResponse.json({ ok: false, error: 'Thiếu sản phẩm/số lượng' }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`update products set stock = stock + ${qty} where id::text = ${b.product_id}`;
  await sql()`insert into stock_moves (product_id, qty, kind, note) values (${b.product_id},${qty},${b.kind || 'import'},${b.note || 'Nhập hàng'})`;
  return NextResponse.json({ ok: true });
}
