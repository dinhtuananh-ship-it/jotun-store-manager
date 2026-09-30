import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, hasDb } from '@/lib/db';
import { signSession, setSessionCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

// Đăng ký khách hàng (chỉ tạo role customer; admin tạo sẵn trong DB hoặc ENV)
export async function POST(req: Request) {
  const b = await req.json();
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');
  const phone = String(b.phone || '').trim();
  const address = String(b.address || '').trim();
  if (!name || !email || !password) return NextResponse.json({ ok: false, error: 'Nhập họ tên, email và mật khẩu' }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, error: 'Email chưa đúng' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ ok: false, error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Chưa cấu hình DATABASE_URL nên chưa đăng ký được' }, { status: 500 });
  const existed = await sql()`select id from users where email = ${email}`;
  if (existed.length) return NextResponse.json({ ok: false, error: 'Email đã có tài khoản, hãy đăng nhập' }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  const rows = await sql()`insert into users (name,email,phone,address,password_hash,role) values (${name},${email},${phone},${address},${hash},'customer') returning id::text as id, name, email, role`;
  const u = (rows as any)[0];
  const token = await signSession({ id: u.id, email: u.email, name: u.name, role: u.role });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, user: u });
}
