'use client';
import useSWR from 'swr';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { formatVND, formatDateVN, cn } from '@/lib/utils';
const fetcher = (u: string) => fetch(u).then(r => r.json());
const FLOW = ['Chờ xác nhận', 'Đang giao', 'Hoàn thành'];
export default function DonHang() {
  const { data, mutate } = useSWR('/api/orders', fetcher);
  const [filter, setFilter] = useState<'all' | 'web' | 'pos' | 'pending'>('all');
  const orders = data?.orders || [];
  const filtered = orders.filter((o: any) => {
    if (filter === 'web') return o.payment?.includes('COD') || (o.note || '').includes('@');
    if (filter === 'pos') return !(o.payment?.includes('COD') || (o.note || '').includes('@'));
    if (filter === 'pending') return o.status === 'Chờ xác nhận';
    return true;
  });
  const setStatus = async (code: string, status: string) => {
    if (!confirm(`${status} đơn ${code}?`)) return;
    await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, status }) });
    mutate();
  };
  return (
    <div>
      <PageHeader title="🧾 Đơn hàng" sub={`${orders.length} đơn (online + tại quầy) • ${orders.filter((o: any) => o.status === 'Chờ xác nhận').length} chờ xác nhận`}
        actions={<Link href="/pos" className="gradient-gold px-5 py-2.5 rounded-xl font-bold text-jotun-900">+ Tạo đơn tại quầy (POS)</Link>} />
      <div className="flex gap-2 mb-4 flex-wrap no-print">
        {([['all', 'Tất cả'], ['pending', '⏳ Chờ xác nhận'], ['web', '🌐 Đơn web COD'], ['pos', '🏪 Đơn tại quầy']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={cn('px-4 py-2 rounded-xl text-sm font-bold', filter === k ? 'gradient-jotun text-white' : 'glass')}>{l}</button>
        ))}
      </div>
      <div className="grid gap-3">
        {filtered.map((o: any) => (
          <div key={o.id} className="glass rounded-2xl p-4 card-hover">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-jotun text-white grid place-items-center font-black">🧾</div>
              <div className="flex-1 min-w-[220px]">
                <div className="font-extrabold">{o.id} • {o.customer} <span className={cn('ml-1 text-[10px] px-2 py-0.5 rounded-full', o.source === 'web' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600')}>{o.source === 'web' ? '🌐 Online' : '🏪 Tại quầy'}</span></div>
                <div className="text-xs text-slate-500">{o.date ? formatDateVN(o.date) : ''} • {o.payment}</div>
                {o.note && <div className="text-xs text-slate-600 mt-1 bg-slate-50 rounded-lg p-2">{o.note}</div>}
              </div>
              <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full', o.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Đã hủy' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700')}>{o.status}</span>
              <div className="text-right"><div className="font-extrabold text-jotun-700">{formatVND(o.total)}</div><div className="text-[11px] text-emerald-600 font-bold">Lãi {formatVND(o.profit)}</div></div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap no-print">
              {FLOW.filter(s => s !== o.status).map(s => (
                <button key={s} onClick={() => setStatus(o.id, s)} className="text-xs font-bold px-4 py-2 rounded-xl bg-jotun-600 text-white hover:scale-105 transition">→ {s}</button>
              ))}
              {o.status !== 'Đã hủy' && <button onClick={() => setStatus(o.id, 'Đã hủy')} className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 text-red-600">Hủy đơn</button>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="glass rounded-2xl p-6 text-center text-sm text-slate-400">Không có đơn nào trong mục này</div>}
      </div>
    </div>
  );
}
