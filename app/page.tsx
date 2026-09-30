'use client';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, PaintBucket, Phone, MapPin, Clock, Award, Factory } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import Logo from '@/components/Logo';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Home() {
  const { data } = useSWR('/api/products', fetcher);
  const featured = (data?.products || []).slice(0, 4);

  return (
    <div>
      {/* Hero cho khách hàng */}
      <div className="gradient-jotun rounded-3xl text-white p-8 md:p-12 relative overflow-hidden">
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute right-6 top-4 text-7xl md:text-9xl opacity-30">🪣</motion.div>
        <Logo height={54} className="shadow-lg" />
        <div className="text-sm font-bold bg-white/20 inline-block px-3 py-1 rounded-full">✅ Đại lý phân phối sơn Jotun • Chính hãng 100%</div>
        <h1 className="text-3xl md:text-5xl font-black mt-3 leading-tight">Sơn nhà đẹp bền màu<br/><span className="text-brand-yellow">Đơn vị cam kết — Bán hàng chính hãng</span></h1>
        <p className="mt-3 text-blue-100 max-w-xl">Jotashield ngoại thất, Majestic & Essence nội thất, chống thấm WaterGuard... Đặt online, <b>chỉ thanh toán khi nhận hàng (COD)</b>. Miễn phí tư vấn màu & dự toán.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cua-hang" className="gradient-gold text-jotun-900 px-7 py-3.5 rounded-2xl font-extrabold hover:scale-105 transition flex items-center gap-2">🛒 Mua sơn ngay <ArrowRight size={18}/></Link>
          <Link href="/tra-cuu" className="bg-white/15 border border-white/30 px-7 py-3.5 rounded-2xl font-bold hover:bg-white/25 transition">🔍 Tra cứu đơn hàng</Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-blue-50">
          <span className="flex gap-1.5 items-center"><Truck size={16}/> Giao 2-24h nội thành</span>
          <span className="flex gap-1.5 items-center"><ShieldCheck size={16}/> Bảo hành màu chính hãng</span>
          <a href="tel:0903123456" className="flex gap-1.5 items-center font-bold"><Phone size={16}/> 0969 919 520</a>
        </div>
      </div>

      {/* Thông tin cửa hàng */}
      <div className="glass rounded-3xl p-6 mt-6">
        <div className="font-extrabold text-xl flex items-center gap-2">🏪 Thông tin cửa hàng</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="font-bold flex items-center gap-1.5"><MapPin size={15} className="text-jotun-600"/> Địa chỉ</div>
            <p className="text-slate-500 mt-1">Số 46 Đường Lý Sơn, Thượng Thanh<br/>Chi nhánh: Long Biên, Hà Nội</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="font-bold flex items-center gap-1.5"><Clock size={15} className="text-jotun-600"/> Giờ mở cửa</div>
            <p className="text-slate-500 mt-1">T2 – CN: 8h00 – 17h00</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="font-bold flex items-center gap-1.5"><Phone size={15} className="text-jotun-600"/> Liên hệ</div>
            <p className="text-slate-500 mt-1">Hotline: <a href="tel:0903123456" className="font-bold text-jotun-700">0969 919 520</a><br/>Zalo/FB: Ngo Hong Phuc</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="font-bold flex items-center gap-1.5"><Award size={15} className="text-jotun-600"/> Cam kết</div>
            <p className="text-slate-500 mt-1">Pha màu máy chuẩn • Đổi trả 7 ngày • Tư vấn & dự toán miễn phí</p>
          </div>
        </div>
      </div>

      {/* Về hãng Jotun */}
      <div className="rounded-3xl p-6 mt-6 bg-gradient-to-br from-jotun-900 via-jotun-700 to-jotun-500 text-white">
        <div className="font-extrabold text-xl flex items-center gap-2"><Factory size={20}/> Về hãng sơn Jotun</div>
        <p className="text-sm text-blue-100 mt-2 leading-relaxed max-w-3xl">
          Jotun là tập đoàn sơn Na Uy thành lập năm 1926, có mặt tại hơn 100 quốc gia — nổi tiếng với các công trình biểu tượng
          như tháp Eiffel hay tòa nhà Burj Khalifa. Tại Việt Nam, Jotun dẫn đầu phân khúc sơn trang trí cao cấp và sơn công nghiệp
          hàng hải nhờ khả năng chống tia UV, chống rêu mốc và bền màu vượt trội trong khí hậu nóng ẩm.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-center text-sm">
          {[
            { t: 'Jotashield', d: 'Ngoại thất • bền 8 năm' },
            { t: 'Majestic', d: 'Nội thất cao cấp' },
            { t: 'Essence', d: 'Lau chùi dễ • kháng khuẩn' },
            { t: 'WaterGuard', d: 'Chống thấm sân thượng' },
          ].map((b, i) => (
            <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-3">
              <div className="font-extrabold text-brand-yellow">{b.t}</div>
              <div className="text-xs text-blue-100 mt-0.5">{b.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sản phẩm bán chạy */}
      {featured.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end justify-between mb-3">
            <div className="font-extrabold text-xl">🔥 Sơn bán chạy</div>
            <Link href="/cua-hang" className="text-sm font-bold text-jotun-600 hover:underline">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featured.map((p: any) => (
              <Link key={p.id} href={`/cua-hang/${p.id}`} className="glass rounded-2xl p-3 card-hover">
                {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-36 object-cover rounded-xl" /> : <div className="w-full h-36 grid place-items-center text-5xl bg-slate-50 rounded-xl">🎨</div>}
                <div className="font-bold text-sm mt-2 line-clamp-2 min-h-[2.5em]">{p.name}</div>
                <div className="font-extrabold text-jotun-700 text-sm">{formatVND(p.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Danh mục nổi bật */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          { e: '🏠', t: 'Nội thất', d: 'Majestic • Essence • Jotaplast' },
          { e: '🏡', t: 'Ngoại thất', d: 'Jotashield bền 8 năm' },
          { e: '💧', t: 'Chống thấm', d: 'WaterGuard sàn & tường' },
          { e: '🏭', t: 'Công nghiệp', d: 'Penguard cho sắt thép' },
        ].map((c, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className="glass rounded-2xl p-4 text-center">
            <div className="text-4xl">{c.e}</div>
            <div className="font-extrabold mt-1">{c.t}</div>
            <div className="text-xs text-slate-500">{c.d}</div>
          </motion.div>
        ))}
      </div>

      {/* Cách mua */}
      <div className="glass rounded-3xl p-6 mt-6">
        <div className="font-extrabold text-xl flex items-center gap-2"><PaintBucket size={20}/> Mua hàng 3 bước — không cần chuyển khoản trước</div>
        <div className="grid md:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="bg-slate-50 rounded-2xl p-4"><b>1. Chọn sơn & màu</b><p className="text-slate-500 mt-1">Thêm vào giỏ, xem giá + phí ship ước tính ngay.</p></div>
          <div className="bg-slate-50 rounded-2xl p-4"><b>2. Đặt hàng COD</b><p className="text-slate-500 mt-1">Nhập tên, SĐT, địa chỉ. Shop gọi xác nhận trong 15 phút.</p></div>
          <div className="bg-slate-50 rounded-2xl p-4"><b>3. Nhận hàng & trả tiền</b><p className="text-slate-500 mt-1">Kiểm tra hàng rồi mới thanh toán tiền mặt/chuyển khoản.</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/cua-hang" className="gradient-jotun text-white px-6 py-3 rounded-2xl font-bold">Bắt đầu mua sắm</Link>
        </div>
      </div>
    </div>
  );
}
