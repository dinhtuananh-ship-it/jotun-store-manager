import { NextResponse } from 'next/server';
import { sql, hasDb, mockCustomers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get('scope');
  // scope=online: khách đăng ký qua web (bảng users) + tổng tiền/đơn web — tách khỏi khách cửa hàng
  if (scope === 'online') {
    if (!hasDb()) return NextResponse.json({ customers: [], mode: 'mock' });
    try {
      const rows = await sql()`select u.id::text as id, u.name, u.email, u.phone, u.address,
        u.created_at, count(o.id)::int as orders, coalesce(sum(case when o.status <> 'Đã hủy' then o.total else 0 end),0)::int as total_bought
        from users u left join orders o on o.user_id = u.id
        where u.role = 'customer' group by u.id order by total_bought desc`;
      return NextResponse.json({ customers: rows, mode: 'neon' });
    } catch { return NextResponse.json({ customers: [], mode: 'mock-fallback' }); }
  }
  if (!hasDb()) return NextResponse.json({ customers: mockCustomers, mode: 'mock' });
  try {
    const rows = await sql()`select id::text as id, name, phone, address, type, debt, total_bought from customers order by total_bought desc`;
    return NextResponse.json({ customers: rows.length ? rows : mockCustomers, mode: 'neon' });
  } catch { return NextResponse.json({ customers: mockCustomers, mode: 'mock-fallback' }); }
}

export async function POST(req: Request) {
  const b = await req.json();
  if (!b.name) return NextResponse.json({ ok: false, error: 'Thiếu tên khách' }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`insert into customers (name,phone,address,type,debt) values (${b.name},${b.phone || ''},${b.address || ''},${b.type || 'Lẻ'},${b.debt || 0})`;
  return NextResponse.json({ ok: true });
}

// Admin sửa thông tin khách cửa hàng (tên/SĐT/địa chỉ/loại/công nợ)
export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ ok: false, error: 'Thiếu id' }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`update customers set name=${b.name}, phone=${b.phone || ''}, address=${b.address || ''}, type=${b.type || 'Lẻ'}, debt=${b.debt || 0} where id::text = ${b.id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`delete from customers where id::text = ${id}`;
  return NextResponse.json({ ok: true });
}
