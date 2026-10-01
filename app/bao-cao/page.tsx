'use client';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { PageHeader, StatCard } from '@/components/ui';
import { formatVND, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, Printer, Save, Sparkles } from 'lucide-react';

const fetcher = (u: string) => fetch(u).then(r => r.json());
const COLORS = ['#003DA5', '#00b0f0', '#FFC72C', '#E30613', '#10b981', '#8b5cf6'];
const vnMonth = (d: Date) => new Date(d.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 7);
const labelMonth = (m: string) => `Tháng ${m.slice(5)}/${m.slice(0, 4)}`;

// "AI nhận định": sinh nhận định định kỳ từ số liệu thật của tháng
function buildInsights(d: any): string[] {
  if (!d || d.empty) return ['Chưa có số liệu tháng này — bán đơn đầu tiên để AI phân tích nhé.'];
  const out: string[] = [];
  const g = d.growth || {};
  out.push(g.revenue >= 0
    ? `Doanh thu ${labelMonth(d.month)} đạt ${formatVND(d.cur.revenue)}, tăng ${g.revenue}% so với tháng trước — giữ đà này nhé.`
    : `Doanh thu giảm ${Math.abs(g.revenue)}% so với tháng trước (còn ${formatVND(d.cur.revenue)}). Nên chạy combo Jotashield + chống thấm và gọi lại khách thầu cũ.`);
  out.push(`Giá trị đơn trung bình ${formatVND(d.cur.avg)} (${g.avg >= 0 ? '+' : ''}${g.avg}%): ${d.cur.avg < 2000000 ? 'giỏ hàng còn nhỏ — training upsell sơn lót + bột trét kèm mỗi đơn.' : 'tốt, khách chịu chi — duy trì gợi ý combo.'}`);
  const web = (d.bySource || []).find((s: any) => s.source === 'web');
  const webShare = d.cur.revenue ? Math.round(((web?.revenue || 0) / d.cur.revenue) * 100) : 0;
  out.push(`Kênh online (COD) chiếm ${webShare}% doanh thu (${formatVND(web?.revenue || 0)}): ${webShare < 30 ? 'còn thấp — đăng thêm video/ảnh công trình lên trang chủ.' : 'rất tốt — đảm bảo xác nhận đơn web trong 15 phút.'}`);
  if (d.byCat?.length) out.push(`Nhóm bán mạnh nhất: ${d.byCat[0].category} (${formatVND(d.byCat[0].revenue)}) — giữ tồn tối thiểu 2 tuần bán của nhóm này.`);
  if (d.debt?.total > 0) {
    const top = (d.debt.debtors || []).slice(0, 2).map((x: any) => `${x.name} (${formatVND(x.debt)})`).join(', ');
    out.push(`Công nợ tồn ${formatVND(d.debt.total)} ở ${d.debt.count} khách, lớn nhất: ${top}. Gọi thu hồi trước ngày 5 tháng sau.`);
  } else out.push('Không còn công nợ tồn — dòng tiền khỏe.');
  if (d.pending?.length) out.push(`Còn ${d.pending.length} đơn web chờ xác nhận — duyệt ngay để cộng doanh thu, đừng để khách đợi quá 15 phút.`);
  if (d.cancelled > 0) out.push(`Có ${d.cancelled} đơn bị hủy trong tháng — gọi lại hỏi lý do, kiểm tra giá/ship có cao không.`);
  if (d.lowStock?.length) out.push(`Sắp hết hàng: ${d.lowStock.slice(0, 3).map((p: any) => `${p.name} (còn ${p.stock})`).join(', ')} — nhập bổ sung trong tuần.`);
  const margin = d.cur.revenue ? Math.round((d.cur.profit / d.cur.revenue) * 100) : 0;
  out.push(`Biên lợi nhuận ${margin}% (chuẩn sơn Jotun ~23%): ${margin < 18 ? 'đang mỏng — xem lại chiết khấu POS có cho quá tay không.' : 'khỏe — giữ cơ cấu hàng cao cấp.'}`);
  return out;
}

export default function BaoCao() {
  const [offset, setOffset] = useState(0);
  const base = useMemo(() => { const d = new Date(); d.setMonth(d.getMonth() + offset); return d; }, [offset]);
  const month = vnMonth(base);
  const { data, mutate, isLoading } = useSWR(`/api/bao-cao?month=${month}`, fetcher);
  const [saving, setSaving] = useState(false);
  const insights = useMemo(() => buildInsights(data), [data]);

  const save = async () => {
    if (!confirm(`Chốt & lưu báo cáo ${labelMonth(month)}? Mỗi tháng chốt 1 lần để đối chiếu về sau.`)) return;
    setSaving(true);
    await fetch('/api/bao-cao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month }) });
    setSaving(false); mutate();
    alert('Đã lưu báo cáo tháng này ✅');
  };

  const d = data || {};
  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
  const dailyFull = Array.from({ length: daysInMonth }, (_, i) => {
    const f = (d.daily || []).find((x: any) => x.day === i + 1);
    return { day: `N${i + 1}`, revenue: f ? Number(f.revenue) : 0 };
  });
  const srcPie = (d.bySource || []).map((s: any) => ({ name: s.source === 'web' ? 'Online COD' : 'Tại quầy', value: Number(s.revenue) }));

  return (
    <div>
      <PageHeader title="📈 Báo cáo tháng" sub={`Số liệu thật từ Neon • ${labelMonth(month)} • chốt định kỳ 1 tháng 1 lần`}
        actions={<>
          <button onClick={() => setOffset(o => o - 1)} className="glass px-3 py-2.5 rounded-xl font-bold"><ChevronLeft size={16}/></button>
          <span className="px-3 py-2.5 font-extrabold">{labelMonth(month)}</span>
          <button onClick={() => setOffset(Math.min(0, offset + 1))} disabled={offset >= 0} className="glass px-3 py-2.5 rounded-xl font-bold disabled:opacity-40"><ChevronRight size={16}/></button>
          <button onClick={save} disabled={saving} className="gradient-jotun text-white px-4 py-2.5 rounded-xl font-bold flex gap-1.5 items-center text-sm"><Save size={15}/> {saving ? '...' : 'Chốt tháng'}</button>
          <button onClick={() => window.print()} className="glass px-4 py-2.5 rounded-xl font-bold flex gap-1.5 items-center text-sm no-print"><Printer size={15}/> In</button>
        </>} />
      {isLoading && <div className="mb-4 p-3 rounded-xl bg-blue-50 text-jotun-700 text-sm font-bold animate-pulse">⏳ Đang tổng hợp số liệu...</div>}
      {d.snapshot && <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">✅ Tháng này đã được chốt lưu. Số đang xem là số liệu live mới nhất.</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`Doanh thu ${labelMonth(month)}`} value={formatVND(d.cur?.revenue || 0)} delta={`${(d.growth?.revenue ?? 0) >= 0 ? '▲ +' : '▼ '}${d.growth?.revenue ?? 0}% vs tháng trước`} emoji="💰" color="bg-emerald-400" />
        <StatCard label="Lợi nhuận" value={formatVND(d.cur?.profit || 0)} delta={`${d.cur?.orders || 0} đơn đã xác nhận`} emoji="📊" color="bg-blue-500" />
        <StatCard label="Đơn trung bình" value={formatVND(d.cur?.avg || 0)} delta={`${(d.growth?.avg ?? 0) >= 0 ? '+' : ''}${d.growth?.avg ?? 0}% vs tháng trước`} emoji="🧺" color="bg-amber-400" />
        <StatCard label="Công nợ tồn" value={formatVND(d.debt?.total || 0)} delta={`${d.debt?.count || 0} khách còn nợ`} emoji="🤝" color="bg-purple-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <motion.div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="font-bold mb-3">Doanh thu từng ngày {labelMonth(month)}</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyFull}>
                <XAxis dataKey="day" interval={2} fontSize={11} /><YAxis tickFormatter={(v: number) => `${Math.round(v / 1000000)}tr`} fontSize={11} />
                <Tooltip formatter={(v: any) => formatVND(Number(v))} />
                <Bar dataKey="revenue" fill="#003DA5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div className="glass rounded-2xl p-5">
          <div className="font-bold mb-3">Online vs Tại quầy</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={srcPie.length ? srcPie : [{ name: 'Chưa có số', value: 1 }]} dataKey="value" nameKey="name" outerRadius={85} label>
                  {srcPie.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatVND(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="glass rounded-2xl p-5">
          <div className="font-bold mb-2">🏆 Top sản phẩm tháng này</div>
          {(d.top || []).length === 0 && <div className="text-sm text-slate-400">Chưa có đơn xác nhận trong tháng.</div>}
          {(d.top || []).map((t: any, i: number) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0 text-sm">
              <span className={cn('w-6 h-6 rounded-full grid place-items-center text-xs font-black', i < 3 ? 'gradient-gold text-jotun-900' : 'bg-slate-100')}>{i + 1}</span>
              <span className="flex-1 font-bold truncate">{t.name}</span>
              <span className="text-xs text-slate-500">x{t.qty}</span>
              <b className="text-jotun-700">{formatVND(t.revenue)}</b>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="font-bold mb-2">📂 Nhóm hàng theo doanh thu</div>
          {(d.byCat || []).length === 0 && <div className="text-sm text-slate-400">Chưa có số liệu.</div>}
          {(d.byCat || []).map((c: any, i: number) => (
            <div key={i} className="py-1.5 text-sm">
              <div className="flex justify-between"><b>{c.category}</b><span className="font-bold text-jotun-700">{formatVND(c.revenue)}</span></div>
              <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full gradient-jotun rounded-full" style={{ width: `${d.cur?.revenue ? Math.round((c.revenue / d.cur.revenue) * 100) : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.div className="rounded-2xl p-5 mt-4 bg-gradient-to-br from-jotun-900 via-jotun-700 to-jotun-500 text-white">
        <div className="font-extrabold text-lg flex items-center gap-2"><Sparkles size={19}/> 🤖 AI nhận định {labelMonth(month)} <span className="text-[11px] font-normal bg-white/20 px-2 py-0.5 rounded-full">tổng hợp từ số liệu thật • ra mỗi tháng 1 lần</span></div>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {insights.map((s, i) => <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-2"><span className="text-brand-yellow font-black">{i + 1}.</span><span>{s}</span></motion.li>)}
        </ul>
        {(d.savedMonths || []).length > 0 && <div className="mt-3 text-xs text-blue-100">📚 Các tháng đã chốt lưu: {d.savedMonths.join(', ')}</div>}
      </motion.div>
    </div>
  );
}
