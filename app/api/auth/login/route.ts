import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, hasDb } from '@/lib/db';
import { signSession, setSessionCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

// Đăng nhập cả admin + khách. Admin mặc định: admin@jotun.vn / admin123 (tạo khi login lần đầu) hoặc ENV admin/jotun123
export async function POST(req: Request) {
  const b = await req.json();
  const email = String(b.email || b.username || '').trim().toLowerCase();
  const password = String(b.password || '');
  if (!email || !password) return NextResponse.json({ ok: false, error: 'Nhập email và mật khẩu' }, { status: 400 });

  // Fallback admin ENV (giữ tương thích demo cũ)
  const envU = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const envP = process.env.ADMIN_PASSWORD || 'jotun123';
  if ((email === envU || email === 'admin' || email === 'admin@jotun.vn') && password === envP) {
    const token = await signSession({ id: 'env-admin', email: 'admin@jotun.vn', name: 'Quản trị viên', role: 'admin' });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, user: { id: 'env-admin', email: 'admin@jotun.vn', name: 'Quản trị viên', role: 'admin' } });
  }
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
  // Tự tạo admin DB lần đầu nếu chưa có
  if (email === 'admin@jotun.vn') {
    const existed = await sql()`select id::text as id, name, email, role, password_hash from users where email='admin@jotun.vn'`;
    if (!existed.length) {
      const hash = await bcrypt.hash('admin123', 10);
      await sql()`insert into users (name,email,password_hash,role) values ('Quản trị viên','admin@jotun.vn',${hash},'admin')`;
    }
  }
  const rows = await sql()`select id::text as id, name, email, role, password_hash from users where email = ${email}`;
  if (!rows.length) return NextResponse.json({ ok: false, error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
  const u = (rows as any)[0];
  const valid = await bcrypt.compare(password, u.password_hash);
  if (!valid) return NextResponse.json({ ok: false, error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
  const token = await signSession({ id: u.id, email: u.email, name: u.name, role: u.role });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, user: { id: u.id, email: u.email, name: u.name, role: u.role } });
}
