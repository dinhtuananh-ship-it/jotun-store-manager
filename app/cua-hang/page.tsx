'use client';
import { useEffect, useMemo, useState, Suspense } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, X, Truck, ShieldCheck, Banknote } from 'lucide-react';
import { formatVND, cn } from '@/lib/utils';
import Link from 'next/link';

const fetcher = (u: string) => fetch(u).then(r => r.json());
type Cart = Record<string, number>;

export default function CuaHang() {
  const { data } = useSWR('/api/products', fetcher);
  const products: any[] = data?.products || [];
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tất cả');
  const [cart, setCart] = useState<Cart>({});
  const [openCart, setOpenCart] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' });
  const [placing, setPlacing] = useState(false);
  const [doneCode, setDoneCode] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('jotun_cart') || '{}')); } catch {}
    if (typeof window !== 'undefined' && window.location.search.includes('cart=1')) setOpenCart(true);
    fetch('/api/auth/me').then(r => r.json()).then(j => {
      setMe(j.user);
      if (j.user) setForm(f => ({ ...f, name: f.name || j.user.name || '', phone: f.phone || '', address: f.address || '' }));
    }).catch(() => {});
  }, []);

  const save = (c: Cart) => {
    setCart(c);
    localStorage.setItem('jotun_cart', JSON.stringify(c));
    window.dispatchEvent(new Event('jotun-cart'));
  };
  const syncDb = (id: string, qty: number) => {
    if (!me) return;
    fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id, qty }) }).catch(() => {});
  };
  const add = (id: string) => { const q = (cart[id] || 0) + 1; save({ ...cart, [id]: q }); syncDb(id, q); };
  const sub = (id: string) => { const n = { ...cart }; n[id] = (n[id] || 0) - 1; const q = n[id]; if (q <= 0) delete n[id]; save(n); syncDb(id, Math.max(0, q)); };

  const cats: string[] = useMemo(() => ['Tất cả', ...(products.map(p => String(p.category)) as string[]).filter((v, i, a) => a.indexOf(v) === i)], [products]);
  const filtered = products.filter(p => (cat === 'Tất cả' || p.category === cat) && ((p.name + p.sku).toLowerCase().includes(q.toLowerCase())));
  const items = Object.entries(cart).map(([id, qty]) => ({ ...products.find(p => String(p.id) === String(id)), qty })).filter(x => x.id);
  const total = items.reduce((s: number, it: any) => s + it.price * it.qty, 0);
  const ship = total >= 5000000 || total === 0 ? 0 : 50000;

  const placeOrder = async () => {
    if (!items.length) return alert('Giỏ hàng trống!');
    if (!me) { if (confirm('Bạn cần đăng nhập để đặt hàng. Chuyển tới đăng nhập?')) window.location.href = '/dang-nhap'; return; }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return alert('Vui lòng nhập Họ tên + SĐT + Địa chỉ nhận hàng');
    if (!/^0\d{8,10}$/.test(form.phone.replace(/\s/g, ''))) return alert('SĐT chưa đúng (bắt đầu bằng 0, 9-11 số)');
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'web', customer_name: form.name, customer_phone: form.phone, address: form.address, note: `${form.note} [${me.email}]`,
          payment: 'COD - Thanh toán khi nhận hàng', items: items.map((i: any) => ({ product_id: i.id, product_name: i.name, qty: i.qty, price: i.price })) }) });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || 'Đặt hàng thất bại');
      setDoneCode(j.code || 'DH-WEB');
      save({});
    } catch (e: any) { alert(e.message || 'Đặt hàng lỗi, thử lại giúp bạn nhé'); }
    setPlacing(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-shimmer">🛍️ Cửa hàng sơn Jotun</h1>
          <p className="text-sm text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
            <span className="flex items-center gap-1"><Banknote size={14}/> COD — chỉ trả tiền khi nhận hàng</span>
            <span className="flex items-center gap-1"><Truck size={14}/> Freeship đơn từ 5tr</span>
            <span className="flex items-center gap-1"><ShieldCheck size={14}/> Chính hãng</span>
          </p>
        </div>
        <button onClick={() => setOpenCart(true)} className="gradient-jotun text-white px-5 py-2.5 rounded-xl font-bold">🧺 Giỏ hàng ({items.reduce((s: number, i: any) => s + i.qty, 0)}) • {formatVND(total)}</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm sơn, mã màu... VD: Majestic, chống thấm" className="w-full pl-10 pr-4 py-2.5 rounded-xl border shadow-sm outline-none focus:ring-2 ring-jotun-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {cats.map(c => <button key={c} onClick={() => setCat(c)} className={cn('px-3 py-2 rounded-xl text-sm font-bold', cat === c ? 'gradient-jotun text-white' : 'glass')}>{c}</button>)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((p: any) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-4 card-hover flex flex-col">
            <Link href={`/cua-hang/${p.id}`}>
              {p.image_url
                ? <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-40 object-cover rounded-xl" />
                : <div className="text-5xl text-center h-40 grid place-items-center bg-slate-50 rounded-xl">{p.image_emoji || '🎨'}</div>}
              <div className="font-bold text-sm mt-2 leading-tight line-clamp-2 min-h-[2.5em] hover:text-jotun-600">{p.name}</div>
            </Link>
            <div className="text-[11px] text-slate-500">{p.sku} • {p.unit} • 🎨 {p.color_code}</div>
            <div className="font-extrabold text-jotun-700 mt-1">{formatVND(p.price)}</div>
            <div className="flex gap-1.5 mt-2">
              <Link href={`/cua-hang/${p.id}`} className="flex-1 text-center bg-slate-100 font-bold py-2 rounded-xl text-sm hover:bg-slate-200">Chi tiết</Link>
              <button onClick={() => add(p.id)} className="flex-1 gradient-gold text-jotun-900 font-bold py-2 rounded-xl text-sm hover:scale-[1.03] transition flex items-center justify-center gap-1"><Plus size={15}/> Thêm</button>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center text-slate-400 py-12">Không tìm thấy sơn phù hợp — thử từ khóa khác nhé 🎨</div>}

      {/* Drawer giỏ + đặt COD */}
      <AnimatePresence>
        {openCart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/45 z-50 flex justify-end" onClick={() => setOpenCart(false)}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 28 }} className="bg-white w-full max-w-md h-full overflow-y-auto p-5">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-xl">🧺 Giỏ hàng của bạn</div>
                <button onClick={() => setOpenCart(false)} className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center"><X size={16}/></button>
              </div>
              {!doneCode ? (<>
                <div className="space-y-2 mt-4">
                  {items.length === 0 && <div className="text-center text-slate-400 py-8">Giỏ trống — quay lại chọn sơn nhé 🪣</div>}
                  {items.map((it: any) => (
                    <div key={it.id} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
                      <div className="text-3xl">{it.image_emoji}</div>
                      <div className="flex-1 min-w-0"><div className="text-xs font-bold truncate">{it.name}</div><div className="text-xs text-jotun-600 font-bold">{formatVND(it.price)}</div></div>
                      <button onClick={() => sub(it.id)} className="w-7 h-7 rounded-full bg-white shadow grid place-items-center"><Minus size={14}/></button>
                      <span className="font-bold w-5 text-center text-sm">{it.qty}</span>
                      <button onClick={() => add(it.id)} className="w-7 h-7 rounded-full bg-jotun-600 text-white grid place-items-center"><Plus size={14}/></button>
                    </div>
                  ))}
                </div>
                {items.length > 0 && (<>
                  <div className="mt-4 space-y-2">
                    <div className="font-bold">📍 Thông tin nhận hàng (COD)</div>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Họ tên *" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="SĐT *" className="border rounded-xl px-3 py-2.5 text-sm" />
                      <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ nhận hàng *" className="border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                    <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú: màu, giờ giao..." className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div className="mt-3 text-sm space-y-1 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex justify-between"><span>Tạm tính</span><b>{formatVND(total)}</b></div>
                    <div className="flex justify-between"><span>Phí ship</span><b>{ship === 0 ? 'Miễn phí 🎉' : formatVND(ship)}</b></div>
                    <div className="flex justify-between font-extrabold text-base"><span>Tổng COD</span><span className="text-jotun-700">{formatVND(total + ship)}</span></div>
                    <div className="text-xs text-amber-700">💵 Bạn KHÔNG cần chuyển khoản trước — nhận hàng, kiểm tra rồi mới trả tiền.</div>
                  </div>
                  <button onClick={placeOrder} disabled={placing} className="mt-3 w-full gradient-jotun text-white py-3.5 rounded-2xl font-extrabold disabled:opacity-50">
                    {placing ? '⏳ Đang đặt...' : `✅ Đặt hàng COD • ${formatVND(total + ship)}`}
                  </button>
                </>)}
              </>) : (
                <div className="text-center py-8">
                  <div className="text-6xl">🎉</div>
                  <div className="font-black text-xl mt-2">Đặt hàng thành công!</div>
                  <div className="mt-2 text-sm">Mã đơn của bạn: <b className="text-jotun-700">{doneCode}</b></div>
                  <p className="text-sm text-slate-500 mt-2">Shop sẽ gọi xác nhận trong 15 phút. Bạn <b>thanh toán khi nhận hàng</b>, được kiểm tra hàng trước.</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Link href={`/tra-cuu?q=${doneCode}`} className="gradient-jotun text-white px-5 py-2.5 rounded-xl font-bold">🔍 Theo dõi đơn</Link>
                    <button onClick={() => { setDoneCode(null); setOpenCart(false); }} className="glass px-5 py-2.5 rounded-xl font-bold">Mua tiếp</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
