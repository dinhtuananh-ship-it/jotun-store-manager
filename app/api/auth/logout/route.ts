import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';
export const dynamic = 'force-dynamic';
export async function POST() {
  await clearSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('jotun_session');
  res.cookies.delete('jotun_admin');
  return res;
}
