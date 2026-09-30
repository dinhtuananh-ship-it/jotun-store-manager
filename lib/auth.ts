// Auth đơn giản cho 1 admin — client-safe (cookie thường để demo).
// Khi cần bảo mật thật, hãy chuyển sang NextAuth / middleware kiểm tra cookie httpOnly.
export const DEMO_USER = 'admin';
export const DEMO_PASS = 'jotun123';
export function checkLogin(u: string, p: string) {
  const eu = process.env.NEXT_PUBLIC_ADMIN_USER || DEMO_USER;
  // chấp nhận demo mặc định để dễ chạy thử
  return (u === 'admin' && p === 'jotun123') || (u === eu && p.length > 0);
}
