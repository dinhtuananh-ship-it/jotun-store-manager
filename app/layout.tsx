import './globals.css';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'Đại lý Sơn Jotun — Cửa hàng & Quản lý bán hàng',
  description: 'Mua sơn Jotun chính hãng, thanh toán khi nhận hàng. Quản lý POS, kho, công nợ trên Neon + Vercel.',
  icons: { icon: '/jotun-icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
