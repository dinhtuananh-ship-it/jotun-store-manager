'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { formatVND, formatDateVN, cn } from '@/lib/utils';
import Link from 'next/link';
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function TaiKhoan() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(j => setUser(j.user)); }, []);
  const { data } = useSWR(user ? `/api/orders?q=${encodeURIComponent(user.email)}` : null, fetcher);
  const myOrders = (data?.orders || []).filter((o: any) => o.note?.includes(user?.email) || o.customer === user?.name);

  if (user === null) return <div className="glass rounded-2xl p-8 text-center">Chưa đăng nhập — <Link href="/dang-nhap" className="font-bold text-jotun-600 underline">Đăng nhập</Link></div>;
  return (
    <div>
      <h1 className="text-2xl font-black">👤 Tài khoản của {user.name}</h1>
      <p className="text-sm text-slate-500">{user.email} • {user.role === 'admin' ? 'Quản trị viên 👑' : 'Khách hàng'} • Thanh toán duy nhất: COD</p>
      <div className="font-bold mt-5 mb-2">📦 Đơn hàng của tôi ({myOrders.length})</div>
      <div className="grid gap-2">
        {myOrders.length === 0 && <div className="glass rounded-2xl p-5 text-sm text-slate-500">Chưa có đơn nào. <Link href="/cua-hang" className="font-bold text-jotun-600 underline">Mua sơn ngay</Link></div>}
        {myOrders.map((o: any) => (
          <div key={o.id} className="glass rounded-2xl p-4 flex flex-wrap gap-2 items-center">
            <b>{o.id}</b>
            <span className={cn('text-xs font-bold px-3 py-1 rounded-full', o.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Đã hủy' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700')}>{o.status}</span>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{o.payment}</span>
            <span className="ml-auto font-extrabold text-jotun-700">{formatVND(o.total)}</span>
            <div className="w-full text-xs text-slate-500">{o.date ? formatDateVN(o.date) : ''}</div>
          </div>
        ))}
      </div>
      {user.role === 'admin' && <Link href="/dashboard" className="inline-block mt-4 gradient-jotun text-white px-5 py-2.5 rounded-xl font-bold">Vào trang quản trị →</Link>}
    </div>
  );
}
