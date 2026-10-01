'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { formatVND, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Pencil, Trash2, BadgeCheck } from 'lucide-react';
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function KhachHang() {
  const [tab, setTab] = useState<'store' | 'online'>('store');
  const { data, mutate } = useSWR(tab === 'store' ? '/api/customers' : '/api/customers?scope=online', fetcher);
  const [form, setForm] = useState({ name: '', phone: '', address: '', type: 'Lẻ' });
  const [editing, setEditing] = useState<any>(null);
  const customers = data?.customers || [];

  const save = async () => {
    if (!form.name) return alert('Nhập tên khách!');
    await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', phone: '', address: '', type: 'Lẻ' }); mutate();
  };
  const saveEdit = async () => {
    await fetch('/api/customers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    setEditing(null); mutate();
  };
  const remove = async (id: string, name: string) => {
    if (!confirm(`Xóa khách ${name}?`)) return;
    await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
    mutate();
  };
  // Khách trả nợ: nhập số tiền đã trả -> trừ công nợ
  const collectDebt = async (c: any) => {
    const v = prompt(`Khách ${c.name} đang nợ ${formatVND(c.debt)}. Nhập số tiền vừa trả (để trống = trả hết):`, String(c.debt));
    if (v === null) return;
    const paid = v.trim() === '' ? c.debt : Number(v);
    if (isNaN(paid) || paid < 0) return alert('Số tiền không hợp lệ');
    await fetch('/api/customers', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, debt: Math.max(0, c.debt - paid) }) });
    mutate();
  };

  return (
    <div>
      <PageHeader title="👥 Khách hàng" sub="Tại cửa hàng (sửa/xóa/thu nợ) + Online đặt web" />
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('store')} className={cn('px-4 py-2 rounded-xl text-sm font-bold', tab === 'store' ? 'gradient-jotun text-white' : 'glass')}>🏪 Tại cửa hàng ({tab === 'store' ? customers.length : '...'})</button>
        <button onClick={() => setTab('online')} className={cn('px-4 py-2 rounded-xl text-sm font-bold', tab === 'online' ? 'gradient-jotun text-white' : 'glass')}>🌐 Online đặt web</button>
      </div>

      {tab === 'store' && (
        <div className="glass rounded-2xl p-4 mb-4 grid md:grid-cols-5 gap-2 no-print">
          <input placeholder="Tên khách / công ty *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-xl px-3 py-2" />
          <input placeholder="SĐT" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border rounded-xl px-3 py-2" />
          <input placeholder="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="border rounded-xl px-3 py-2" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-xl px-3 py-2">
            <option>Lẻ</option><option>Thợ thầu</option><option>Công trình</option><option>Đại lý</option>
          </select>
          <button onClick={save} className="gradient-jotun text-white rounded-xl font-bold">+ Thêm khách</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {customers.length === 0 && <div className="glass rounded-2xl p-6 text-center text-sm text-slate-400 col-span-2">Chưa có khách nào trong mục này</div>}
        {customers.map((c: any) => (
          <div key={c.id} className="glass rounded-2xl p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-gold grid place-items-center text-xl font-black shrink-0">{c.name?.[0]}</div>
              <div className="flex-1 min-w-0"><div className="font-bold truncate">{c.name}</div>
                <div className="text-xs text-slate-500">📞 {c.phone || '—'}{c.email ? ` • ${c.email}` : ''}{c.address ? ` • ${c.address}` : ''}</div></div>
              <span className="text-[11px] bg-jotun-100 text-jotun-700 px-2 py-1 rounded-full font-bold shrink-0">{tab === 'online' ? `${c.orders || 0} đơn web` : c.type}</span>
            </div>
            {tab === 'store' ? (
              <>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-2.5"><div className="text-[11px] text-slate-400">Đã mua</div><div className="font-extrabold">{formatVND(c.total_bought)}</div></div>
                  <div className={`rounded-xl p-2.5 ${c.debt > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}><div className="text-[11px] text-slate-400">Công nợ</div><div className={`font-extrabold ${c.debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{c.debt > 0 ? formatVND(c.debt) : 'Hết nợ ✅'}</div></div>
                </div>
                <div className="flex gap-2 mt-3 no-print">
                  <button onClick={() => setEditing({ ...c })} className="flex-1 bg-jotun-100 text-jotun-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"><Pencil size={13}/> Sửa</button>
                  {c.debt > 0 && <button onClick={() => collectDebt(c)} className="flex-1 bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"><BadgeCheck size={13}/> Thu nợ</button>}
                  <button onClick={() => remove(c.id, c.name)} className="bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-xl"><Trash2 size={13}/></button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-2.5"><div className="text-[11px] text-slate-400">Tổng mua web</div><div className="font-extrabold">{formatVND(c.total_bought)}</div></div>
                <div className="bg-purple-50 rounded-xl p-2.5"><div className="text-[11px] text-slate-400">Thanh toán</div><div className="font-extrabold text-purple-700">COD khi nhận hàng</div></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" onClick={() => setEditing(null)}>
          <motion.div onClick={e => e.stopPropagation()} initial={{ scale: .9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-3">
            <div className="font-extrabold text-xl">✏️ Sửa khách hàng</div>
            <label className="block"><span className="text-xs font-bold text-slate-600">👤 Họ tên / công ty *</span>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block"><span className="text-xs font-bold text-slate-600">📞 Số điện thoại</span>
                <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>
              <label className="block"><span className="text-xs font-bold text-slate-600">🗂️ Loại khách</span>
                <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm">
                  <option>Lẻ</option><option>Thợ thầu</option><option>Công trình</option><option>Đại lý</option>
                </select></label>
            </div>
            <label className="block"><span className="text-xs font-bold text-slate-600">📍 Địa chỉ</span>
              <input value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-xs font-bold text-slate-600">💳 Công nợ còn lại (VNĐ) — nhập 0 nếu đã trả hết</span>
              <input type="number" value={editing.debt || 0} onChange={e => setEditing({ ...editing, debt: Number(e.target.value) })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>
            <button onClick={saveEdit} className="w-full gradient-jotun text-white py-3 rounded-2xl font-bold">Lưu thay đổi</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
