'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ShopHeader from '@/components/ShopHeader';
import VideoWidget from '@/components/VideoWidget';
import MapWidget from '@/components/MapWidget';

// Trang public (khách hàng) không hiện sidebar admin
const PUBLIC_PREFIX = ['/cua-hang', '/tra-cuu', '/dang-nhap', '/tai-khoan', '/gio-hang'];
export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || '/';
  const isPublic = path === '/' || PUBLIC_PREFIX.some(p => path === p || path.startsWith(p + '/'));
  if (isPublic) {
    return (
      <div className="min-h-screen">
        <ShopHeader />
        <main className="max-w-[1200px] mx-auto w-full p-4 md:p-8">{children}</main>
        <footer className="text-center text-xs text-slate-400 py-10">
          Đại lý Sơn Jotun chính hãng • Hotline: 0969 919 520 • Giao hàng toàn quốc, thanh toán khi nhận hàng (COD)
        </footer>
        <VideoWidget />
        <MapWidget />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full">{children}</main>
    </div>
  );
}
