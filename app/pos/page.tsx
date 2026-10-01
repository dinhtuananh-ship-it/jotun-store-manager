'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { PageHeader } from '@/components/ui';
import { formatVND, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, Printer, ScanLine } from 'lucide-react';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function POS() {
  const { data } = useSWR('/api/products', fetcher);
  const products: any[] = data?.products || [];
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tất cả');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState('Khách lẻ');
  const [payment, setPayment] = useState('Tiền mặt');
  const [discount, setDiscount] = useState(5);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [paying, setPaying] = useState(false);

  const cats: string[] = useMemo(() => ['Tất cả', ...(products.map((p) => String(p.category)) as string[]).filter((v, i, a) => a.indexOf(v) === i)], [products]);
  const filtered = products.filter((p: any) =>
    (cat === 'Tất cả' || p.category === cat) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())));

  const cartItems = Object.entries(cart).map(([id, qty]) => ({ ...products.find((p: any) => String(p.id) === String(id)), qty })).filter(x => x.id);
  const total = cartItems.reduce((s, it: any) => s + it.price * it.qty, 0);
  const pct = Math.min(100, Math.max(0, Number(discount) || 0));
  const factor = (100 - pct) / 100;
  const totalAfter = Math.round(total * factor);

  const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) => setCart(c => { const n = { ...c }; n[id]--; if (n[id] <= 0) delete n[id]; return n; });

  const checkout = async () => {
    if (!cartItems.length) return;
    setErr(''); setPaying(true);
    try {
      // Giá đã trừ chiết khấu % admin nhập để doanh thu Tổng quan khớp số tiền thực thu
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'pos', customer_name: customer, payment,
          note: `Bán tại quầy (CK ${pct}%)`,
          items: cartItems.map((i: any) => ({ product_id: i.id, product_name: i.name, qty: i.qty, price: Math.round(i.price * factor) })) }) });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || 'Lưu đơn thất bại');
      setDone(j.code || 'DH-MOI');
      setCart({});
      setTimeout(() => window.print(), 400);
    } catch (e: any) { setErr(e.message || 'Thanh toán lỗi — đơn chưa được lưu, doanh thu chưa tăng'); }
    setPaying(false);
  };

  return (
    <div>
      <PageHeader title="🛒 Bán hàng POS" sub="Bấm Thanh toán để lưu đơn + cộng doanh thu, rồi tự in hóa đơn"
        actions={<button onClick={checkout} disabled={!cartItems.length || paying} className="gradient-jotun text-white px-4 py-2 rounded-xl font-bold flex gap-2 items-center disabled:opacity-40"><Printer size={16}/> {paying ? 'Đang lưu...' : 'Thanh toán & In hóa đơn'}</button>} />
      {done && <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-center">✅ Thanh toán thành công! Mã đơn: {done} — đã cộng vào Tổng quan <Link href="/dashboard" className="underline whitespace-nowrap">xem ngay →</Link></motion.div>}
      {err && <div className="mb-4 p-4 rounded-2xl bg-red-50 text-red-600 font-bold text-center">⚠️ {err}</div>}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-3 flex-wrap no-print">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm sơn Jotun, mã SKU... (VD: Majestic)" className="w-full pl-10 pr-4 py-2.5 rounded-xl border shadow-sm outline-none focus:ring-2 ring-jotun-400" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {cats.map(c => <button key={c} onClick={() => setCat(c)} className={cn('px-3 py-2 rounded-xl text-sm font-bold', cat === c ? 'gradient-jotun text-white' : 'glass')}>{c}</button>)}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <AnimatePresence>
              {filtered.map((p: any) => (
                <motion.button key={p.id} layout initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  onClick={() => add(p.id)} whileTap={{ scale: .96 }}
                  className="glass rounded-2xl p-4 text-left card-hover relative overflow-hidden group">
                  <div className="text-4xl">{p.image_emoji || '🎨'}</div>
                  <div className="font-bold text-sm mt-2 leading-tight line-clamp-2 min-h-[2.5em]">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.sku} • {p.unit}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-jotun-700">{formatVND(p.price)}</span>
                    <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-bold', p.stock < 15 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700')}>Kho: {p.stock}</span>
                  </div>
                  <div className="absolute inset-0 bg-jotun-600/0 group-hover:bg-jotun-600/10 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                    <span className="bg-jotun-600 text-white text-sm font-bold px-4 py-2 rounded-full">+ Thêm</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 h-fit sticky top-4">
          <div className="font-extrabold text-lg flex items-center gap-2"><ScanLine size={18}/> Hóa đơn hiện tại</div>
          <div className="grid grid-cols-3 gap-2 mt-3 no-print">
            <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Tên khách" className="border rounded-xl px-3 py-2 text-sm col-span-1" />
            <select value={payment} onChange={e => setPayment(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
              <option>Tiền mặt</option><option>Chuyển khoản</option><option>Công nợ</option><option>Quẹt thẻ</option>
            </select>
            <label className="flex items-center gap-1 border rounded-xl px-2 py-2 text-sm bg-amber-50" title="Chiết khấu % giảm giá cho khách">
              <span className="text-xs font-bold text-amber-700 whitespace-nowrap">CK%</span>
              <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full bg-transparent outline-none font-bold text-sm" />
            </label>
          </div>
          <div className="mt-3 space-y-2 max-h-[320px] overflow-auto scrollbar-thin">
            {cartItems.length === 0 && <div className="text-center text-slate-400 text-sm py-8">Giỏ trống — chạm vào sản phẩm để thêm 🪣</div>}
            {cartItems.map((it: any) => (
              <motion.div key={it.id} layout className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
                <div className="text-2xl">{it.image_emoji}</div>
                <div className="flex-1 min-w-0"><div className="text-xs font-bold truncate">{it.name}</div><div className="text-xs text-jotun-600 font-bold">{formatVND(it.price)}</div></div>
                <div className="flex items-center gap-1 no-print">
                  <button onClick={() => sub(it.id)} className="w-7 h-7 rounded-full bg-white shadow grid place-items-center"><Minus size={14}/></button>
                  <span className="font-bold w-6 text-center">{it.qty}</span>
                  <button onClick={() => add(it.id)} className="w-7 h-7 rounded-full bg-jotun-600 text-white grid place-items-center"><Plus size={14}/></button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Tạm tính</span><b>{formatVND(total)}</b></div>
            <div className="flex justify-between"><span>Chiết khấu ({pct}%)</span><b className="text-emerald-600">-{formatVND(total - totalAfter)}</b></div>
            <div className="flex justify-between text-lg font-extrabold"><span>Tổng thu</span><span className="text-jotun-700">{formatVND(totalAfter)}</span></div>
          </div>
          <button onClick={checkout} disabled={!cartItems.length || paying} className="mt-3 w-full gradient-jotun text-white py-3.5 rounded-2xl font-extrabold text-lg hover:scale-[1.02] transition disabled:opacity-40 no-print">
            {paying ? '⏳ Đang lưu đơn...' : `💳 Thanh toán • ${formatVND(totalAfter)}`}
          </button>
          <button onClick={() => setCart({})} className="mt-2 w-full text-xs text-slate-400 flex items-center justify-center gap-1 no-print"><Trash2 size={12}/> Xóa giỏ</button>
        </div>
      </div>
    </div>
  );
}
