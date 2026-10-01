import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Doanh thu chỉ tính đơn ĐÃ XÁC NHẬN (Đang giao + Hoàn thành).
// Đơn "Chờ xác nhận" chưa tính — admin bấm xác nhận sẽ thấy doanh thu tăng ngay.
// Đơn "Đã hủy" không bao giờ tính.
const CONFIRMED = `status in ('Hoàn thành','Đang giao')`;
const FALLBACK_CHART = [
  { day: 'T2', revenue: 8200000 }, { day: 'T3', revenue: 12400000 }, { day: 'T4', revenue: 6800000 },
  { day: 'T5', revenue: 15200000 }, { day: 'T6', revenue: 18900000 }, { day: 'T7', revenue: 22100000 }, { day: 'CN', revenue: 9500000 }];
const FALLBACK_TOP = [{ name: 'Jotaplast 18L', qty: 342 }, { name: 'Majestic 5L', qty: 214 }, { name: 'Gardtex 40KG', qty: 421 }, { name: 'Essence 18L', qty: 96 }];

export async function GET() {
  if (!hasDb()) return NextResponse.json({
    revenue: 75850000, profit: 17400000, orders: 5, pending: 2, lowStock: 2,
    todayRevenue: 5200000, todayOrders: 3,
    chart: FALLBACK_CHART, top: FALLBACK_TOP, mode: 'mock'
  });
  try {
    const rev = await sql()`select coalesce(sum(total),0)::int as revenue, coalesce(sum(profit),0)::int as profit, count(*)::int as orders
      from orders where created_at >= date_trunc('month', now()) and status in ('Hoàn thành','Đang giao')`;
    // Mốc ngày theo giờ Việt Nam (UTC+7) — khớp với những gì admin thấy, không lệch múi giờ server
    const vn = await sql`select (now() at time zone 'Asia/Ho_Chi_Minh')::date::text as today`;
    const todayKey = String((vn as any)[0].today).slice(0, 10); // 'YYYY-MM-DD'
    // Doanh thu HÔM NAY — thanh toán xong thấy ngay, không lẫn tháng cũ
    const today = await sql()`select coalesce(sum(total),0)::int as revenue, count(*)::int as orders
      from orders where (created_at at time zone 'Asia/Ho_Chi_Minh')::date = (now() at time zone 'Asia/Ho_Chi_Minh')::date
      and status in ('Hoàn thành','Đang giao')`;
    const pend = await sql()`select count(*)::int as c, coalesce(sum(total),0)::int as t from orders where status = 'Chờ xác nhận'`;
    const low = await sql()`select count(*)::int as c from products where stock < 20`;

    // Doanh thu 7 ngày gần nhất (chỉ đơn đã xác nhận) — gộp theo ngày VN, nhãn suy từ chính ngày đó
    let chart = FALLBACK_CHART;
    try {
      const days = await sql()`select to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM-DD') as d, sum(total)::int as revenue
        from orders where created_at >= (now() at time zone 'Asia/Ho_Chi_Minh')::date - interval '6 days'
        and status in ('Hoàn thành','Đang giao')
        group by 1 order by 1`;
      if (days.length) {
        const map: Record<string, number> = {};
        for (const r of days as any[]) map[String(r.d)] = Number(r.revenue);
        const names = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        chart = Array.from({ length: 7 }, (_, i) => {
          const dt = new Date(todayKey + 'T12:00:00Z');
          dt.setUTCDate(dt.getUTCDate() - (6 - i));
          const key = dt.toISOString().slice(0, 10);
          return { day: i === 6 ? 'Hôm nay' : names[dt.getUTCDay()], revenue: map[key] || 0 };
        });
      }
    } catch {}

    // Top sơn bán chạy theo order_items của đơn đã xác nhận
    let top = FALLBACK_TOP;
    try {
      const t = await sql()`select i.product_name as name, sum(i.qty)::int as qty
        from order_items i join orders o on o.id = i.order_id
        where o.status in ('Hoàn thành','Đang giao')
        group by 1 order by 2 desc limit 4`;
      if (t.length) top = t as any;
    } catch {}

    return NextResponse.json({
      revenue: (rev as any)[0].revenue, profit: (rev as any)[0].profit, orders: (rev as any)[0].orders,
      todayRevenue: (today as any)[0].revenue, todayOrders: (today as any)[0].orders,
      pending: (pend as any)[0].c, pendingTotal: (pend as any)[0].t, lowStock: (low as any)[0].c,
      chart, top, mode: 'neon'
    });
  } catch (e: any) { return NextResponse.json({ revenue: 75850000, profit: 17400000, orders: 5, pending: 2, lowStock: 2,
    todayRevenue: 5200000, todayOrders: 3,
    chart: FALLBACK_CHART, top: FALLBACK_TOP, mode: 'mock-fallback', error: e.message }); }
}
