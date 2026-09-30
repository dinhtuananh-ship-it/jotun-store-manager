'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { formatVND, formatDateVN } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Kho() {
  const { data, mutate } = useSWR('/api/products', fetcher);
  const { data: stockData, mutate: mutateMoves } = useSWR('/api/stock', fetcher);
  const [show, setShow] = useState(false);
  const [sel, setSel] = useState('');
  const [qty, setQty] = useState(10);
  const [note, setNote] = useState('');
  const products = data?.products || [];
  const moves = stockData?.moves || [];
  const low = products.filter((p: any) => p.stock < 20);
  const totalVal = products.reduce((s: number, p: any) => s + p.stock * (p.cost_price || 0), 0);

  const doImport = async () => {
    if (!sel || !qty) return alert('Chọn sản phẩm + số lượng');
    await fetch('/api/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: sel, qty: Number(qty), note: note || 'Nhập hàng' }) });
    setShow(false); setSel(''); setQty(10); setNote('');
    mutate(); mutateMoves();
  };

  return (
    <div>
      <PageHeader title="🏭 Kho hàng" sub={`Tổng giá trị vốn: ${formatVND(totalVal)} • ${low.length} mã sắp hết • Nhập hàng đồng bộ sang Sản phẩm`}
        actions={<button onClick={() => setShow(true)} className="gradient-jotun text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 items-center"><Plus size={16}/> Nhập hàng</button>} />
      {low.length > 0 && (
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold">
          ⚠️ Cảnh báo hết hàng: {low.map((p: any) => p.name).slice(0, 3).join(', ')}{low.length > 3 ? ` +${low.length - 3} mã khác` : ''} — hãy nhập thêm!
        </motion.div>
      )}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-jotun-800 text-white text-left"><th className="p-3">Sản phẩm</th><th className="p-3">SKU</th><th className="p-3 text-right">Tồn</th><th className="p-3 text-right">Giá vốn</th><th className="p-3 text-right">Giá trị kho</th><th className="p-3">Trạng thái</th><th className="p-3 no-print"></th></tr></thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-blue-50/60 transition">
                <td className="p-3 font-bold">{p.image_url ? <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover inline-block mr-2" /> : '🎨 '}{p.name}</td>
                <td className="p-3 text-slate-500 text-xs">{p.sku}</td>
                <td className="p-3 text-right font-extrabold">{p.stock} {p.unit?.split(' ').pop()}</td>
                <td className="p-3 text-right">{formatVND(p.cost_price)}</td>
                <td className="p-3 text-right font-bold text-jotun-700">{formatVND(p.stock * p.cost_price)}</td>
                <td className="p-3">{p.stock < 15 ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">🔴 Nhập gấp</span> : p.stock < 40 ? <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">🟡 Sắp hết</span> : <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">🟢 Đủ hàng</span>}</td>
                <td className="p-3 no-print"><button onClick={() => { setSel(p.id); setShow(true); }} className="text-xs font-bold bg-jotun-100 text-jotun-700 px-3 py-1.5 rounded-lg">+ Nhập</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {moves.length > 0 && (
        <div className="glass rounded-2xl p-5 mt-4">
          <div className="font-bold mb-2">📋 Lịch sử nhập/xuất kho gần nhất</div>
          <div className="space-y-1.5 text-sm max-h-64 overflow-auto">
            {moves.map((m: any) => (
              <div key={m.id} className="flex gap-2 items-center bg-slate-50 rounded-lg px-3 py-2">
                <span className={`font-black ${m.qty >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</span>
                <span className="font-bold">{m.product_name}</span>
                <span className="text-xs text-slate-400">{m.note} • {m.created_at ? formatDateVN(m.created_at) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {show && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" onClick={() => setShow(false)}>
          <motion.div onClick={e => e.stopPropagation()} initial={{ scale: .9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-3">
            <div className="font-extrabold text-xl">📦 Nhập hàng vào kho</div>
            <select value={sel} onChange={e => setSel(e.target.value)} className="w-full border rounded-xl px-3 py-2.5">
              <option value="">— Chọn sản phẩm —</option>
              {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (tồn {p.stock})</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} placeholder="Số lượng nhập" className="border rounded-xl px-3 py-2.5" />
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú (NCC...)" className="border rounded-xl px-3 py-2.5" />
            </div>
            <button onClick={doImport} className="w-full gradient-jotun text-white py-3 rounded-2xl font-bold">Xác nhận nhập +{qty}</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
