'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Search, Home, ReceiptText, Phone, User, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';

export default function ShopHeader() {
  const path = usePathname();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const loadMe = () => fetch('/api/auth/me').then(r => r.json()).then(j => setUser(j.user)).catch(() => {});
  useEffect(() => {
    const f = () => {
      try {
        const c = JSON.parse(localStorage.getItem('jotun_cart') || '{}');
        setCount(Object.values(c as Record<string, number>).reduce((a: number, b: any) => a + Number(b), 0));
      } catch { setCount(0); }
    };
    f(); loadMe();
    window.addEventListener('storage', f);
    window.addEventListener('jotun-cart', f);
    return () => { window.removeEventListener('storage', f); window.removeEventListener('jotun-cart', f); };
  }, [path]);
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    document.cookie = 'jotun_session=; path=/; max-age=0';
    setUser(null);
    router.push('/');
    router.refresh();
  };
  return (
    <header className="sticky top-0 z-40 gradient-jotun text-white shadow-lg">
      <div className="max-w-[1200px] mx-auto px-3 py-2 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-extrabold shrink-0">
          <Logo height={30} />
          <span className="hidden xl:inline text-[15px] whitespace-nowrap">Đại lý phân phối sơn Phúc Thành</span>
        </Link>
        <nav className="hidden md:flex items-center gap-0.5 ml-2 text-sm font-medium whitespace-nowrap">
          <Link href="/" className="px-2.5 py-2 rounded-lg hover:bg-white/15 flex gap-1.5 items-center"><Home size={15}/> Trang chủ</Link>
          <Link href="/cua-hang" className="px-2.5 py-2 rounded-lg hover:bg-white/15 flex gap-1.5 items-center"><Search size={15}/> Cửa hàng</Link>
          <Link href="/tra-cuu" className="px-2.5 py-2 rounded-lg hover:bg-white/15 flex gap-1.5 items-center"><ReceiptText size={15}/> Tra cứu đơn</Link>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <a href="tel:0903123456" className="hidden xl:flex items-center gap-1.5 text-sm bg-white/15 px-3 py-2 rounded-xl whitespace-nowrap"><Phone size={15}/> 0969 919 520</a>
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link href={user.role === 'admin' ? '/dashboard' : '/tai-khoan'} className="bg-white/15 px-2.5 py-2 rounded-xl text-sm font-bold hidden sm:flex gap-1.5 items-center hover:bg-white/25 max-w-[140px] truncate">
                <User size={15} className="shrink-0"/> <span className="truncate">{user.name}</span> {user.role === 'admin' ? '👑' : ''}
              </Link>
              <button onClick={logout} title="Đăng xuất" className="bg-white/15 p-2 rounded-xl hover:bg-white/25"><LogOut size={16}/></button>
            </div>
          ) : (
            <Link href="/dang-nhap" className="bg-white/15 px-3 py-2 rounded-xl text-sm font-bold hover:bg-white/25 hidden sm:flex gap-1.5 items-center whitespace-nowrap"><User size={15}/> Đăng nhập</Link>
          )}
          <Link href="/gio-hang" className="relative bg-white text-jotun-800 font-bold px-3 py-2 rounded-xl flex gap-1.5 items-center hover:scale-105 transition text-sm whitespace-nowrap">
            <ShoppingCart size={17}/> <span className="hidden lg:inline">Giỏ hàng</span>
            {count > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full grid place-items-center font-black">{count}</span>}
          </Link>
        </div>
      </div>
      <div className="md:hidden flex gap-1 px-4 pb-2 text-sm">
        <Link href="/cua-hang" className="px-3 py-1.5 rounded-lg bg-white/10">Cửa hàng</Link>
        <Link href="/tra-cuu" className="px-3 py-1.5 rounded-lg bg-white/10">Tra cứu đơn</Link>
        {!user && <Link href="/dang-nhap" className="px-3 py-1.5 rounded-lg bg-white/10">Đăng nhập</Link>}
      </div>
    </header>
  );
}
