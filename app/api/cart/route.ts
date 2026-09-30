import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { getSession } from '@/lib/session';
export const dynamic = 'force-dynamic';

const isUUID = (v: any) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
async function sessionUserId() {
  const s = await getSession().catch(() => null);
  return s && isUUID(s.id) ? s.id : null; // admin demo ENV (id 'env-admin') thì dùng giỏ local, không lỗi uuid
}

// Giỏ hàng lưu DB theo user (đồng bộ đa thiết bị). Khách vãng lai vẫn dùng localStorage ở client.
export async function GET() {
  const uid = await sessionUserId();
  if (!uid || !hasDb()) return NextResponse.json({ items: [], mode: !uid ? 'guest' : 'neon-empty' });
  const rows = await sql()`select c.product_id::text as product_id, c.qty, p.name as product_name, p.price, p.image_url, p.stock
    from cart_items c join products p on p.id = c.product_id where c.user_id::text = ${uid} order by c.updated_at desc`;
  return NextResponse.json({ items: rows, mode: 'neon' });
}

// PUT { product_id, qty } — qty=0 là xóa
export async function PUT(req: Request) {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
  const b = await req.json();
  if (!b.product_id) return NextResponse.json({ ok: false }, { status: 400 });
  const qty = Number(b.qty || 0);
  if (qty <= 0) await sql()`delete from cart_items where user_id::text = ${uid} and product_id::text = ${b.product_id}`;
  else await sql()`insert into cart_items (user_id, product_id, qty) values (${uid},${b.product_id},${qty})
    on conflict (user_id, product_id) do update set qty = excluded.qty, updated_at = now()`;
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ ok: false }, { status: 401 });
  await sql()`delete from cart_items where user_id::text = ${uid}`;
  return NextResponse.json({ ok: true });
}
