import { NextResponse } from 'next/server';
import { sql, hasDb, mockProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!hasDb()) return NextResponse.json({ products: mockProducts, mode: 'mock' });
    const rows = await sql()`select id::text as id, sku, name, category, brand, unit, price, cost_price, stock, color_code, finish, description, image_url, coverage, warranty, features from products order by created_at desc`;
    const mapped = rows.map((r: any) => ({ ...r, image_emoji: pickEmoji(r.category) }));
    return NextResponse.json({ products: mapped, mode: 'neon' });
  } catch (e: any) {
    return NextResponse.json({ products: mockProducts, mode: 'mock-fallback', error: e.message });
  }
}
function pickEmoji(cat: string) {
  if (cat?.includes('Ngoại')) return '🪣';
  if (cat?.includes('lót')) return '🧴';
  if (cat?.includes('Bột')) return '🏗️';
  if (cat?.includes('thấm')) return '💧';
  if (cat?.includes('Công')) return '🏭';
  return '🎨';
}
export async function POST(req: Request) {
  const b = await req.json();
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`insert into products (sku,name,category,brand,unit,price,cost_price,stock,color_code,description,image_url,coverage,warranty,features)
    values (${b.sku},${b.name},${b.category || 'Nội thất'},${b.brand || 'Jotun'},${b.unit || 'Lon 5L'},${b.price || 0},${b.cost_price || 0},${b.stock || 0},${b.color_code || ''},${b.description || ''},${b.image_url || ''},${b.coverage || ''},${b.warranty || ''},${b.features || ''})`;
  return NextResponse.json({ ok: true, mode: 'neon' });
}

// Admin sửa sản phẩm: PUT { id, ...fields }
export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ ok: false, error: 'Thiếu id' }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`update products set sku=${b.sku}, name=${b.name}, category=${b.category}, brand=${b.brand || 'Jotun'},
    unit=${b.unit}, price=${b.price || 0}, cost_price=${b.cost_price || 0}, stock=${b.stock || 0},
    color_code=${b.color_code || ''}, finish=${b.finish || ''}, description=${b.description || ''},
    image_url=${b.image_url || ''}, coverage=${b.coverage || ''}, warranty=${b.warranty || ''}, features=${b.features || ''}
    where id::text = ${b.id}`;
  return NextResponse.json({ ok: true });
}

// Admin xóa sản phẩm: DELETE ?id=
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'Thiếu id' }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`delete from products where id::text = ${id}`;
  return NextResponse.json({ ok: true });
}
