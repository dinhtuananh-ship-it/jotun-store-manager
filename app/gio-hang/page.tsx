'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowLeft, Banknote } from 'lucide-react';
import { formatVND } from '@/lib/utils';

export default function GioHang() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' });
  const [me, setMe] = useState<any>(null);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('jotun_cart') || '{}')); } catch {}
    fetch('/api/products').then(r => r.json()).then(j => setProducts(j.products || []));
    fetch('/api/auth/me').then(r => r.json()).then(j => {
      setMe(j.user);
      if (j.user) setForm(f => ({ ...f, name: f.name || j.user.name || '' }));
    }).catch(() => {});
  }, []);

  const save = (c: Record<string, number>) => {
    setCart(c);
    localStorage.setItem('jotun_cart', JSON.stringify(c));
    window.dispatchEvent(new Event('jotun-cart'));
    // Đồng bộ lên DB nếu đã đăng nhập
    if (me) Object.entries(c);
  };
  const setQty = async (id: string, qty: number) => {
    const n = { ...cart };
    if (qty <= 0) delete n[id]; else n[id] = qty;
    save(n);
    if (me) await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id, qty }) }).catch(() => {});
  };

  const items = Object.entries(cart).map(([id, qty]) => ({ ...products.find(p => String(p.id) === String(id)), qty })).filter(x => x.id);
  const total = items.reduce((s: number, it: any) => s + it.price * it.qty, 0);
  const ship = total >= 5000000 || total === 0 ? 0 : 50000;

  const place = async () => {
    if (!items.length) return alert('Giỏ trống!');
    if (!me) { if (confirm('Đăng nhập để đặt hàng COD?')) router.push('/dang-nhap'); return; }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return alert('Nhập họ tên + SĐT + địa chỉ');
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'web', customer_name: form.name, customer_phone: form.phone, address: form.address, note: `${form.note} [${me.email}]`, payment: 'COD - Thanh toán khi nhận hàng', items: items.map((i: any) => ({ product_id: i.id, product_name: i.name, qty: i.qty, price: i.price })) }) });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || 'Đặt hàng thất bại');
      setDone(j.code);
      save({});
      if (me) await fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
    } catch (e: any) { alert(e.message || 'Lỗi đặt hàng'); }
    setPlacing(false);
  };

  if (done) return (
    <div className="glass rounded-3xl p-10 text-center max-w-lg mx-auto">
      <div className="text-6xl">🎉</div>
      <div className="font-black text-2xl mt-2">Đặt hàng thành công!</div>
      <div className="mt-2">Mã đơn: <b className="text-jotun-700">{done}</b></div>
      <p className="text-sm text-slate-500 mt-2">Shop gọi xác nhận trong 15 phút. Thanh toán khi nhận hàng.</p>
      <div className="flex gap-2 justify-center mt-5">
        <Link href={`/tra-cuu?q=${done}`} className="gradient-jotun text-white px-6 py-3 rounded-2xl font-bold">🔍 Theo dõi đơn</Link>
        <Link href="/cua-hang" className="glass px-6 py-3 rounded-2xl font-bold">Mua tiếp</Link>
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Link href="/cua-hang" className="text-sm font-bold text-jotun-600 flex items-center gap-1 mb-3"><ArrowLeft size={15}/> Tiếp tục mua sắm</Link>
        <h1 className="text-2xl font-black mb-3">🧺 Giỏ hàng ({items.reduce((s: number, i: any) => s + i.qty, 0)} món)</h1>
        {!me && <div className="mb-3 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold">⚠️ <Link href="/dang-nhap" className="underline">Đăng nhập</Link> để đặt hàng COD và đồng bộ giỏ lên database.</div>}
        <div className="space-y-2">
          {items.length === 0 && <div className="glass rounded-2xl p-10 text-center text-slate-400">Giỏ trống — <Link href="/cua-hang" className="font-bold text-jotun-600 underline">chọn sơn ngay</Link> 🪣</div>}
          {items.map((it: any) => (
            <motion.div key={it.id} layout className="glass rounded-2xl p-3 flex items-center gap-3">
              <Link href={`/cua-hang/${it.id}`}>{it.image_url ? <img src={it.image_url} alt={it.name} className="w-16 h-16 rounded-xl object-cover" /> : <div className="text-4xl w-16 h-16 grid place-items-center bg-slate-50 rounded-xl">🎨</div>}</Link>
              <div className="flex-1 min-w-0">
                <Link href={`/cua-hang/${it.id}`} className="font-bold text-sm hover:text-jotun-600 line-clamp-1">{it.name}</Link>
                <div className="text-jotun-700 font-extrabold text-sm">{formatVND(it.price)} <span className="text-slate-400 font-normal">x {it.qty} = {formatVND(it.price * it.qty)}</span></div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setQty(it.id, it.qty - 1)} className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center"><Minus size={15}/></button>
                <b className="w-6 text-center">{it.qty}</b>
                <button onClick={() => setQty(it.id, it.qty + 1)} className="w-8 h-8 rounded-full bg-jotun-600 text-white grid place-items-center"><Plus size={15}/></button>
              </div>
              <button onClick={() => setQty(it.id, 0)} className="text-red-400 hover:text-red-600"><Trash2 size={17}/></button>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="glass rounded-3xl p-5 h-fit sticky top-24">
        <div className="font-extrabold text-lg">📍 Nhận hàng (COD)</div>
        <div className="space-y-2 mt-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Họ tên *" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="SĐT *" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ *" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
          <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
        </div>
        <div className="mt-3 text-sm space-y-1 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex justify-between"><span>Tạm tính</span><b>{formatVND(total)}</b></div>
          <div className="flex justify-between"><span>Ship</span><b>{ship === 0 ? 'Miễn phí 🎉' : formatVND(ship)}</b></div>
          <div className="flex justify-between font-extrabold text-base"><span>Tổng COD</span><span className="text-jotun-700">{formatVND(total + ship)}</span></div>
          <div className="text-xs text-amber-700 flex gap-1 items-center"><Banknote size={13}/> Không chuyển khoản trước — kiểm hàng rồi trả tiền.</div>
        </div>
        <button onClick={place} disabled={placing || !items.length} className="mt-3 w-full gradient-jotun text-white py-3.5 rounded-2xl font-extrabold disabled:opacity-40">
          {placing ? '⏳...' : `✅ Đặt COD • ${formatVND(total + ship)}`}
        </button>
      </div>
    </div>
  );
}
