import { NextResponse } from 'next/server';
import { sql, hasDb, mockProducts } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!hasDb()) {
    const p = mockProducts.find((x: any) => String(x.id) === String(id) || x.sku === id);
    if (!p) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ product: { ...p, description: p.name + ' chính hãng Jotun.', image_url: '', coverage: '', warranty: '', features: '' }, mode: 'mock' });
  }
  const rows = await sql()`select id::text as id, sku, name, category, brand, unit, price, cost_price, stock, color_code, finish, description, image_url, coverage, warranty, features from products where id::text = ${id} or sku = ${id} limit 1`;
  if (!rows.length) return NextResponse.json({ ok: false }, { status: 404 });
  const rel = await sql()`select id::text as id, sku, name, price, image_url, category from products where category = ${(rows as any)[0].category} and id::text <> ${(rows as any)[0].id} limit 4`;
  return NextResponse.json({ product: (rows as any)[0], related: rel, mode: 'neon' });
}
