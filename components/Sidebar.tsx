'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, PaintBucket, Warehouse, Users, Receipt, BarChart3, LogOut, Droplets, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';

const menu = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/pos', label: 'Bán hàng (POS)', icon: ShoppingCart },
  { href: '/san-pham', label: 'Sản phẩm', icon: PaintBucket },
  { href: '/kho', label: 'Kho hàng', icon: Warehouse },
  { href: '/don-hang', label: 'Đơn hàng', icon: Receipt },
  { href: '/khach-hang', label: 'Khách hàng', icon: Users },
  { href: '/bao-cao', label: 'Báo cáo', icon: BarChart3 },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const logout = async () => {
    try { await fetch('/api/auth', { method: 'POST' }); } catch {}
    document.cookie = 'jotun_admin=; path=/; max-age=0';
    router.push('/dang-nhap');
    router.refresh();
  };
  return (
    <aside className="no-print w-64 shrink-0 min-h-screen gradient-jotun text-white p-4 flex flex-col gap-2 sticky top-0 h-screen overflow-y-auto">
      <Link href="/" className="flex items-center gap-3 p-2 mb-4">
        <motion.div initial={false} className="shadow-glow rounded-2xl overflow-hidden"><Logo height={32} className="rounded-2xl" /></motion.div>
        <div>
          <div className="font-extrabold leading-tight">Đại lý Sơn JOTUN</div>
          <div className="text-xs text-blue-100 flex items-center gap-1"><Droplets size={12}/> Chính hãng • Uy tín</div>
        </div>
      </Link>
      <Link href="/cua-hang" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-amber-200 border border-white/20">
        <Store size={20} /> Xem web khách hàng
      </Link>
      {menu.map(m => {
        const active = path === m.href || path?.startsWith(m.href + '/');
        return (
          <Link key={m.href} href={m.href}
            className={cn('flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
              active ? 'bg-white text-jotun-800 shadow-lg scale-[1.02]' : 'hover:bg-white/15 text-blue-50')}>
            <m.icon size={20} /> {m.label}
            {m.href === '/pos' && <span className="ml-auto text-[10px] bg-brand-yellow text-jotun-900 font-bold px-2 py-0.5 rounded-full">HOT</span>}
          </Link>
        );
      })}
      <div className="mt-auto glass rounded-2xl p-4 text-slate-700 text-sm">
        <div className="font-bold text-jotun-700">💡 Mẹo bán hàng</div>
        <p className="text-xs mt-1">Jotashield đang bán chạy mùa mưa. Gợi ý kèm sơn lót chống kiềm để tăng 30% giá trị đơn!</p>
        <button onClick={logout} className="mt-3 flex items-center gap-2 text-xs text-red-600 font-semibold hover:underline">
          <LogOut size={14}/> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
