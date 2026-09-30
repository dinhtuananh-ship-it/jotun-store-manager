'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Minus, Plus, Truck, ShieldCheck, Banknote, ArrowLeft } from 'lucide-react';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [p, setP] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then(r => r.json()).then(j => {
      if (j.product) { setP(j.product); setRelated(j.related || []); }
      else setErr('Không tìm thấy sản phẩm');
    }).catch(() => setErr('Lỗi tải sản phẩm'));
  }, [params.id]);

  const add = () => {
    try {
      const c = JSON.parse(localStorage.getItem('jotun_cart') || '{}');
      c[String(p.id)] = (c[String(p.id)] || 0) + qty;
      localStorage.setItem('jotun_cart', JSON.stringify(c));
      window.dispatchEvent(new Event('jotun-cart'));
    } catch {}
    router.push('/cua-hang?cart=1');
  };

  if (err) return <div className="glass rounded-2xl p-8 text-center">{err} <Link href="/cua-hang" className="text-jotun-600 font-bold underline">Về cửa hàng</Link></div>;
  if (!p) return <div className="glass rounded-2xl p-8 text-center animate-pulse">⏳ Đang tải sản phẩm...</div>;

  return (
    <div>
      <Link href="/cua-hang" className="text-sm text-jotun-600 font-bold flex items-center gap-1 mb-3"><ArrowLeft size={15}/> Về cửa hàng</Link>
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl overflow-hidden">
          {p.image_url
            ? <img src={p.image_url} alt={p.name} className="w-full h-[380px] object-cover" />
            : <div className="w-full h-[380px] grid place-items-center text-9xl bg-gradient-to-br from-blue-50 to-amber-50">🎨</div>}
          <div className="p-3 flex gap-2 text-xs">
            <span className="bg-jotun-100 text-jotun-700 px-2 py-1 rounded-full font-bold">{p.category}</span>
            <span className="bg-slate-100 px-2 py-1 rounded-full">{p.brand}</span>
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">🎨 {p.color_code}</span>
          </div>
        </motion.div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black">{p.name}</h1>
          <div className="text-sm text-slate-500 mt-1">{p.sku} • {p.unit} • {p.finish}</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-3xl font-black text-jotun-700">{formatVND(p.price)}</div>
            <div className={`text-sm font-bold ${p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{p.stock > 0 ? `Còn ${p.stock} • sẵn giao` : 'Hết hàng'}</div>
          </div>
          <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{p.description}</p>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
            <div className="bg-slate-50 rounded-xl p-2.5"><div className="font-bold">Độ phủ</div><div className="text-slate-500 mt-0.5">{p.coverage || '—'}</div></div>
            <div className="bg-slate-50 rounded-xl p-2.5"><div className="font-bold">Bảo hành</div><div className="text-slate-500 mt-0.5">{p.warranty || '—'}</div></div>
            <div className="bg-slate-50 rounded-xl p-2.5"><div className="font-bold">Tính năng</div><div className="text-slate-500 mt-0.5">{p.features || '—'}</div></div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white border rounded-xl px-2 py-1.5">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center"><Minus size={15}/></button>
              <b className="w-8 text-center">{qty}</b>
              <button onClick={() => setQty(Math.min(p.stock || 99, qty + 1))} className="w-8 h-8 rounded-full bg-jotun-600 text-white grid place-items-center"><Plus size={15}/></button>
            </div>
            <button onClick={add} disabled={p.stock <= 0} className="flex-1 gradient-jotun text-white py-3 rounded-2xl font-extrabold disabled:opacity-40">🛒 Thêm vào giỏ • {formatVND(p.price * qty)}</button>
          </div>
          <div className="mt-3 text-xs space-y-1 text-slate-500">
            <div className="flex gap-1.5 items-center"><Banknote size={14}/> COD — nhận hàng kiểm tra rồi mới trả tiền</div>
            <div className="flex gap-1.5 items-center"><Truck size={14}/> Giao 2-24h nội thành, freeship đơn từ 5tr</div>
            <div className="flex gap-1.5 items-center"><ShieldCheck size={14}/> Cam kết chính hãng, pha màu máy chuẩn</div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <div className="font-extrabold text-lg mb-3">🧩 Sản phẩm liên quan</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.map((r: any) => (
              <Link key={r.id} href={`/cua-hang/${r.id}`} className="glass rounded-2xl p-3 card-hover">
                {r.image_url ? <img src={r.image_url} alt={r.name} className="w-full h-32 object-cover rounded-xl" /> : <div className="w-full h-32 grid place-items-center text-5xl bg-slate-50 rounded-xl">🎨</div>}
                <div className="font-bold text-sm mt-2 line-clamp-2 min-h-[2.5em]">{r.name}</div>
                <div className="font-extrabold text-jotun-700 text-sm">{formatVND(r.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
