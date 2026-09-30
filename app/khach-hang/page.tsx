'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { formatVND } from '@/lib/utils';
const fetcher = (u: string) => fetch(u).then(r => r.json());
export default function KhachHang() {
  const { data, mutate } = useSWR('/api/customers', fetcher);
  const [form, setForm] = useState({ name: '', phone: '', address: '', type: 'Lẻ' });
  const customers = data?.customers || [];
  const save = async () => {
    if (!form.name) return alert('Nhập tên khách!');
    await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', phone: '', address: '', type: 'Lẻ' }); mutate();
  };
  return (
    <div>
      <PageHeader title="👥 Khách hàng tại cửa hàng" sub={`${customers.length} khách mua trực tiếp / thợ thầu / công trình — KHÔNG gồm khách đặt online (khách web nằm trong Đơn hàng)`} />
      <div className="glass rounded-2xl p-4 mb-4 grid md:grid-cols-5 gap-2 no-print">
        <input placeholder="Tên khách / công ty" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-xl px-3 py-2" />
        <input placeholder="SĐT" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border rounded-xl px-3 py-2" />
        <input placeholder="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="border rounded-xl px-3 py-2" />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-xl px-3 py-2">
          <option>Lẻ</option><option>Thợ thầu</option><option>Công trình</option><option>Đại lý</option>
        </select>
        <button onClick={save} className="gradient-jotun text-white rounded-xl font-bold">+ Thêm khách</button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {customers.map((c: any) => (
          <div key={c.id} className="glass rounded-2xl p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-gold grid place-items-center text-xl font-black">{c.name?.[0]}</div>
              <div className="flex-1"><div className="font-bold">{c.name}</div><div className="text-xs text-slate-500">📞 {c.phone} • {c.address}</div></div>
              <span className="text-[11px] bg-jotun-100 text-jotun-700 px-2 py-1 rounded-full font-bold">{c.type}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-2.5"><div className="text-[11px] text-slate-400">Đã mua</div><div className="font-extrabold">{formatVND(c.total_bought)}</div></div>
              <div className={`rounded-xl p-2.5 ${c.debt > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}><div className="text-[11px] text-slate-400">Công nợ</div><div className={`font-extrabold ${c.debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{c.debt > 0 ? formatVND(c.debt) : 'Hết nợ ✅'}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
