'use client';
import { PageHeader, StatCard } from '@/components/ui';
import { formatVND } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
const monthly = [
  { m: 'T4', revenue: 182000000, profit: 41000000 }, { m: 'T5', revenue: 205000000, profit: 48000000 },
  { m: 'T6', revenue: 178000000, profit: 39000000 }, { m: 'T7', revenue: 236000000, profit: 56000000 },
  { m: 'T8', revenue: 254000000, profit: 61000000 }, { m: 'T9', revenue: 289000000, profit: 69000000 },
];
export default function BaoCao() {
  return (
    <div>
      <PageHeader title="📈 Báo cáo doanh thu" sub="6 tháng gần nhất • biên lợi nhuận sơn Jotun ~23%" actions={<button onClick={() => window.print()} className="glass px-5 py-2.5 rounded-xl font-bold">🖨️ Xuất báo cáo</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu T9" value={formatVND(289000000)} delta="▲ +13.8%" emoji="💰" color="bg-emerald-400" />
        <StatCard label="Lợi nhuận T9" value={formatVND(69000000)} delta="Biên 23.9%" emoji="📊" color="bg-blue-500" />
        <StatCard label="Đơn trung bình" value={formatVND(4850000)} delta="Tăng giá trị giỏ" emoji="🧺" color="bg-amber-400" />
        <StatCard label="Công nợ thu hồi" value={formatVND(42000000)} delta="Còn 54.5tr" emoji="🤝" color="bg-purple-400" />
      </div>
      <div className="glass rounded-2xl p-5 mt-4">
        <div className="font-bold mb-3">Doanh thu vs Lợi nhuận theo tháng</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <XAxis dataKey="m" /><YAxis tickFormatter={(v: number) => `${v / 1000000}tr`} />
              <Tooltip formatter={(v: any) => formatVND(Number(v))} />
              <Bar dataKey="revenue" fill="#003DA5" radius={[8, 8, 0, 0]} name="Doanh thu" />
              <Bar dataKey="profit" fill="#FFC72C" radius={[8, 8, 0, 0]} name="Lợi nhuận" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass rounded-2xl p-5 mt-4 text-sm leading-relaxed">
        <div className="font-bold mb-2">💡 Nhận định AI bán hàng</div>
        <ul className="list-disc ml-5 text-slate-600 space-y-1">
          <li>Jotaplast & Bột trét Gardtex chiếm 45% sản lượng — giữ tồn tối thiểu 100 đơn vị.</li>
          <li>Khách thầu (Anh Tuấn) nợ 12.5tr quá 20 ngày — gọi thu hồi trước 05/10.</li>
          <li>Mùa mưa: đẩy combo Jotashield + Chống thấm WaterGuard, biên lãi cao nhất (27%).</li>
        </ul>
      </div>
    </div>
  );
}
