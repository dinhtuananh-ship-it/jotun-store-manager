'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { formatVND, formatDateVN, cn } from '@/lib/utils';
import { Suspense } from 'react';

const fetcher = (u: string) => fetch(u).then(r => r.json());

function TraCuuInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [key, setKey] = useState(params.get('q') || '');
  const { data, isLoading } = useSWR(key ? `/api/orders?q=${encodeURIComponent(key)}&scope=web` : null, fetcher);
  const orders = data?.orders || [];
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-black text-shimmer">🔍 Tra cứu đơn hàng của bạn</h1>
      <p className="text-sm text-slate-500 mt-1">Chỉ hiện đơn đặt qua website (COD) — không lẫn đơn tại quầy của shop. Nhập mã đơn hoặc SĐT lúc đặt.</p>
      <form onSubmit={e => { e.preventDefault(); setKey(q); }} className="flex gap-2 mt-4 max-w-xl">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Mã đơn / tên / SĐT..." className="flex-1 border rounded-xl px-4 py-3 shadow-sm outline-none focus:ring-2 ring-jotun-400" />
        <button className="gradient-jotun text-white px-6 rounded-xl font-bold">Tra cứu</button>
      </form>
      {isLoading && <div className="mt-4 text-sm font-bold text-jotun-600 animate-pulse">⏳ Đang tìm...</div>}
      {key && !isLoading && orders.length === 0 && <div className="mt-4 glass rounded-2xl p-5 text-sm">Không tìm thấy đơn nào với {key}. Kiểm tra lại mã hoặc gọi shop 0903 123 456 nhé.</div>}
      <div className="grid gap-3 mt-4">
        {orders.map((o: any) => (
          <div key={o.id} className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <b>{o.id}</b>
              <span className={cn('text-xs font-bold px-3 py-1 rounded-full',
                o.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' :
                o.status === 'Đã hủy' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700')}>{o.status}</span>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{o.payment}</span>
              <span className="ml-auto font-extrabold text-jotun-700">{formatVND(o.total)}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{o.customer} • {o.date ? formatDateVN(o.date) : ''}</div>
            {o.note && <div className="text-xs text-slate-600 mt-1 bg-slate-50 rounded-lg p-2">{o.note}</div>}
            {o.payment?.includes('COD') && o.status === 'Chờ xác nhận' && <div className="text-xs text-amber-700 font-bold mt-2">💵 Đơn COD — bạn thanh toán khi nhận hàng, shop sẽ gọi xác nhận sớm.</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TraCuu() {
  return <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}><TraCuuInner /></Suspense>;
}
