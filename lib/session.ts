import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE = 'jotun_session';
function secret() { return new TextEncoder().encode(process.env.AUTH_SECRET || 'jotun-dev-secret-doi-khi-deploy'); }

export async function signSession(payload: { id: string; email: string; name: string; role: string }) {
  return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret());
}
export async function getSession(): Promise<{ id: string; email: string; name: string; role: string } | null> {
  try {
    const token = cookies().get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return payload as any;
  } catch { return null; }
}
export async function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' });
}
export async function clearSessionCookie() { cookies().delete(COOKIE); }
export { COOKIE };
