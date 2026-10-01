'use client';
import useSWR from 'swr';
import { PageHeader, StatCard } from '@/components/ui';
import { formatVND } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const fetcher = (u: string) => fetch(u).then(r => { if (!r.ok) throw new Error('API ' + r.status); return r.json(); });
const COLORS = ['#003DA5', '#00b0f0', '#FFC72C', '#E30613', '#10b981'];
const FALLBACK_CHART = [
  { day: 'T2', revenue: 8200000 }, { day: 'T3', revenue: 12400000 }, { day: 'T4', revenue: 6800000 },
  { day: 'T5', revenue: 15200000 }, { day: 'T6', revenue: 18900000 }, { day: 'T7', revenue: 22100000 }, { day: 'CN', revenue: 9500000 }];
const FALLBACK_TOP = [{ name: 'Jotaplast 18L', qty: 342 }, { name: 'Majestic 5L', qty: 214 }, { name: 'Gardtex 40KG', qty: 421 }, { name: 'Essence 18L', qty: 96 }];

export default function Dashboard() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher);
  const d = {
    revenue: data?.revenue ?? 75850000,
    profit: data?.profit ?? 17400000,
    orders: data?.orders ?? 5,
    todayRevenue: data?.todayRevenue ?? 0,
    todayOrders: data?.todayOrders ?? 0,
    pending: data?.pending ?? 0,
    pendingTotal: data?.pendingTotal ?? 0,
    lowStock: data?.lowStock ?? 2,
    chart: (data?.chart?.length ? data.chart : FALLBACK_CHART),
    top: (data?.top?.length ? data.top : FALLBACK_TOP),
    mode: data?.mode ?? 'mock',
  };

  return (
    <div>
      <PageHeader title="📊 Tổng quan kinh doanh" sub={`Doanh thu chỉ tính đơn ĐÃ XÁC NHẬN (Đang giao + Hoàn thành) • Nguồn: ${d.mode}${error ? ' (lỗi API, số liệu mẫu)' : ''}`}
        actions={<><Link href="/pos" className="gradient-gold px-5 py-2.5 rounded-xl font-bold text-jotun-900">+ Đơn mới</Link>
        <Link href="/bao-cao" className="glass px-5 py-2.5 rounded-xl font-bold">Báo cáo</Link></>} />
      {isLoading && !data && <div className="mb-4 p-3 rounded-xl bg-blue-50 text-jotun-700 text-sm font-bold animate-pulse">⏳ Đang tải số liệu...</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold">⚠️ Không gọi được /api/dashboard — đang hiển thị số liệu mẫu. Kiểm tra Neon DATABASE_URL.</div>}
      {d.pending > 0 && (
        <Link href="/don-hang" className="mb-4 block p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold hover:scale-[1.01] transition">
          ⏳ Có {d.pending} đơn online chờ xác nhận ({formatVND(d.pendingTotal)}) — bấm để duyệt, doanh thu sẽ cộng ngay sau khi xác nhận →
        </Link>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="💵 Hôm nay (đã xác nhận)" value={formatVND(d.todayRevenue)} delta={`${d.todayOrders} đơn hôm nay`} emoji="🧾" color="bg-emerald-400" />
        <StatCard label="Doanh thu tháng này" value={formatVND(d.revenue)} delta={`Lãi ${formatVND(d.profit)} • ${d.orders} đơn`} emoji="💰" color="bg-blue-500" />
        <StatCard label="Chờ duyệt" value={String(d.pending)} delta={d.pending > 0 ? formatVND(d.pendingTotal) + ' chưa tính' : 'Không đơn chờ'} emoji="⏳" color="bg-amber-400" />
        <StatCard label="Sắp hết hàng" value={String(d.lowStock ?? 2)} delta="Cần nhập thêm" emoji="⚠️" color="bg-red-400" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="font-bold mb-3">Doanh thu 7 ngày qua</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.chart}>
                <XAxis dataKey="day" /><YAxis tickFormatter={(v: number) => `${v / 1000000}tr`} /><Tooltip formatter={(v: any) => formatVND(Number(v))} />
                <Bar dataKey="revenue" fill="#1a5fd7" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="glass rounded-2xl p-5">
          <div className="font-bold mb-3">Top sơn bán chạy</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.top} dataKey="qty" nameKey="name" outerRadius={90} label>
                  {d.top.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }} className="glass rounded-2xl p-5 mt-4">
        <div className="font-bold mb-2">Xu hướng lợi nhuận</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.chart}>
              <XAxis dataKey="day" /><YAxis hide /><Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FFC72C" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
