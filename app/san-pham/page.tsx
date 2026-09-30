'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { formatVND, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
const fetcher = (u: string) => fetch(u).then(r => r.json());
const EMPTY = { id: '', sku: '', name: '', category: 'Nội thất', brand: 'Jotun', unit: 'Lon 5L', price: 0, cost_price: 0, stock: 0, color_code: '', finish: '', description: '', image_url: '', coverage: '', warranty: '', features: '' };

export default function Products() {
  const { data, mutate } = useSWR('/api/products', fetcher);
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const products = (data?.products || []).filter((p: any) => (p.name + p.sku + p.category).toLowerCase().includes(q.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setShow(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ ...p }); setShow(true); };
  const save = async () => {
    if (!form.sku || !form.name) return alert('Nhập SKU + tên sản phẩm');
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await res.json();
    if (j.ok === false) return alert(j.error || 'Lưu thất bại');
    setShow(false); mutate();
  };
  const remove = async (p: any) => {
    if (!confirm(`Xóa ${p.name}? Tồn kho và lịch sử đơn giữ nguyên.`)) return;
    await fetch(`/api/products?id=${p.id}`, { method: 'DELETE' });
    mutate();
  };
  const Field = ({ k, label, hint, type = 'text' }: { k: string; label: string; hint?: string; type?: string }) => (
    <label className="block">
      <span className="block text-xs font-bold text-slate-600 mb-1">{label}</span>
      <input type={type} placeholder={hint || label} value={form[k] ?? ''} onChange={e => setForm({ ...form, [k]: type === 'number' ? Number(e.target.value) : e.target.value })} className="border rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 ring-jotun-400" />
      {hint && <span className="block text-[11px] text-slate-400 mt-0.5">{hint}</span>}
    </label>
  );

  return (
    <div>
      <PageHeader title="🎨 Sản phẩm sơn Jotun" sub={`${products.length} mã hàng • Admin thêm / sửa / xóa`}
        actions={<button onClick={openAdd} className="gradient-jotun text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 items-center"><Plus size={16}/> Thêm sơn mới</button>} />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, SKU, loại..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border shadow-sm outline-none focus:ring-2 ring-jotun-400" />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p: any, i: number) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="glass rounded-2xl p-5 card-hover">
            <div className="flex gap-3">
              {p.image_url
                ? <img src={p.image_url} alt={p.name} loading="lazy" className="w-16 h-16 rounded-2xl object-cover" />
                : <div className="text-5xl w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50 grid place-items-center">{p.image_emoji || '🪣'}</div>}
              <div className="flex-1">
                <div className="font-bold leading-tight">{p.name}</div>
                <div className="text-xs text-slate-500">{p.sku} • {p.brand} • {p.finish}</div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[11px] bg-jotun-100 text-jotun-700 px-2 py-0.5 rounded-full font-bold">{p.category}</span>
                  <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">{p.unit}</span>
                  <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🎨 {p.color_code}</span>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between mt-3">
              <div><div className="text-[11px] text-slate-400">Giá bán</div><div className="font-extrabold text-jotun-700 text-lg">{formatVND(p.price)}</div>
              <div className="text-[11px] text-slate-400">Lãi: {formatVND((p.price || 0) - (p.cost_price || 0))}/sp</div></div>
              <div className={cn('text-center px-3 py-1.5 rounded-xl font-extrabold', p.stock < 15 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-700')}>{p.stock}<div className="text-[10px] font-medium">tồn kho</div></div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden"><motion.div animate={{ width: `${Math.min(100, p.stock)}%` }} className="h-full gradient-jotun rounded-full" /></div>
            <div className="flex gap-2 mt-3 no-print">
              <button onClick={() => openEdit(p)} className="flex-1 bg-jotun-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"><Pencil size={13}/> Sửa</button>
              <button onClick={() => remove(p)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"><Trash2 size={13}/> Xóa</button>
            </div>
          </motion.div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4 overflow-y-auto" onClick={() => setShow(false)}>
          <motion.div onClick={e => e.stopPropagation()} initial={{ scale: .9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-2xl space-y-3 my-8">
            <div className="font-extrabold text-xl">{editing ? '✏️ Sửa sản phẩm' : '➕ Thêm sơn Jotun mới'}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field k="sku" label="📦 Mã SKU (mã hàng)" hint="VD: JOT-MJ-5L — viết ngắn, không dấu" />
              <Field k="name" label="🏷️ Tên sản phẩm" hint="VD: Majestic Nội Thất Bóng Mờ 5L" />
              <label className="block">
                <span className="block text-xs font-bold text-slate-600 mb-1">🗂️ Loại sơn</span>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-xl px-3 py-2 text-sm w-full">
                  <option>Nội thất</option><option>Ngoại thất</option><option>Sơn lót</option><option>Bột trét</option><option>Chống thấm</option><option>Công nghiệp</option><option>Dụng cụ</option>
                </select>
              </label>
              <Field k="unit" label="🥫 Đơn vị / quy cách" hint="VD: Lon 5L, Thùng 18L, Bao 40KG" />
              <Field k="price" label="💰 Giá bán (VNĐ)" hint="Số tiền khách phải trả, VD: 1150000" type="number" />
              <Field k="cost_price" label="📥 Giá vốn / giá nhập (VNĐ)" hint="Giá đại lý nhập vào, VD: 880000" type="number" />
              <Field k="stock" label="📊 Số lượng tồn kho" hint="Số lon/thùng đang có, VD: 50" type="number" />
              <Field k="color_code" label="🎨 Mã màu" hint="VD: Trắng 1001, Kem 1024" />
              <Field k="brand" label="©️ Thương hiệu" hint="VD: Jotun, Majestic, Jotashield..." />
              <Field k="finish" label="✨ Bề mặt hoàn thiện" hint="VD: Mờ, Bóng mờ, Bóng, Lót..." />
            </div>
            <Field k="image_url" label="🖼️ Link ảnh thật của sản phẩm" hint="Dán link https://... ảnh lon sơn thật" />
            <label className="block">
              <span className="block text-xs font-bold text-slate-600 mb-1">📝 Mô tả chi tiết sản phẩm</span>
              <textarea placeholder="VD: Sơn nội thất cao cấp, lau chùi dễ, phù hợp phòng khách..." value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 ring-jotun-400" rows={3} />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field k="coverage" label="📐 Độ phủ" hint="VD: 12 m²/lít" />
              <Field k="warranty" label="🛡️ Bảo hành" hint="VD: 5 năm" />
              <Field k="features" label="⭐ Tính năng nổi bật" hint="VD: Lau chùi dễ, kháng khuẩn" />
            </div>
            <button onClick={save} className="w-full gradient-jotun text-white py-3 rounded-2xl font-bold">{editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
