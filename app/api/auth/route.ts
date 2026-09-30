import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Đăng xuất: xóa cookie rồi trả JSON (client tự chuyển trang, không hiện màn hình đen)
export async function POST() {
  cookies().delete('jotun_admin');
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('jotun_admin');
  return res;
}
export async function GET() { return NextResponse.json({ ok: true }); }
