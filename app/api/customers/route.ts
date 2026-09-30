import { NextResponse } from 'next/server';
import { sql, hasDb, mockCustomers } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function GET() {
  if (!hasDb()) return NextResponse.json({ customers: mockCustomers, mode: 'mock' });
  try {
    const rows = await sql()`select id::text as id, name, phone, address, type, debt, total_bought from customers order by total_bought desc`;
    return NextResponse.json({ customers: rows.length ? rows : mockCustomers, mode: 'neon' });
  } catch { return NextResponse.json({ customers: mockCustomers, mode: 'mock-fallback' }); }
}
export async function POST(req: Request) {
  const b = await req.json();
  if (!hasDb()) return NextResponse.json({ ok: true, mode: 'mock' });
  await sql()`insert into customers (name,phone,address,type) values (${b.name},${b.phone || ''},${b.address || ''},${b.type || 'Lẻ'})`;
  return NextResponse.json({ ok: true });
}
