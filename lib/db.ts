// Kết nối Neon (serverless) + fallback mock khi chưa có DATABASE_URL để vẫn demo/deploy được.
import { neon } from '@neondatabase/serverless';

export function hasDb() { return !!process.env.DATABASE_URL; }

export function sql() {
  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
  return neon(process.env.DATABASE_URL);
}

// ---- Mock data dùng khi chưa cấu hình Neon ----
export const mockProducts = [
  { id: 'p1', sku: 'JOT-JS-15L', name: 'Jotashield Ngoại Thất 15L', category: 'Ngoại thất', brand: 'Jotashield', unit: 'Thùng 15L', price: 2850000, cost_price: 2300000, stock: 42, color_code: 'Trắng 1001', finish: 'Mờ', image_emoji: '🪣', sold: 128 },
  { id: 'p2', sku: 'JOT-MJ-5L', name: 'Majestic Nội Thất Bóng Mờ 5L', category: 'Nội thất', brand: 'Majestic', unit: 'Lon 5L', price: 1150000, cost_price: 880000, stock: 86, color_code: 'Kem 1024', finish: 'Bóng mờ', image_emoji: '🎨', sold: 214 },
  { id: 'p3', sku: 'JOT-ES-18L', name: 'Essence Dễ Lau Chùi 18L', category: 'Nội thất', brand: 'Essence', unit: 'Thùng 18L', price: 1980000, cost_price: 1520000, stock: 35, color_code: 'Xanh Pastel 5452', finish: 'Mờ', image_emoji: '🏠', sold: 96 },
  { id: 'p4', sku: 'JOT-JP-18L', name: 'Jotaplast Nội Thất 18L', category: 'Nội thất', brand: 'Jotaplast', unit: 'Thùng 18L', price: 890000, cost_price: 640000, stock: 120, color_code: 'Trắng sứ', finish: 'Mờ', image_emoji: '🧱', sold: 342 },
  { id: 'p5', sku: 'JOT-SF-PRIMER-18L', name: 'Sơn Lót Chống Kiềm Majestic 18L', category: 'Sơn lót', brand: 'Majestic', unit: 'Thùng 18L', price: 1750000, cost_price: 1350000, stock: 58, color_code: 'Trắng', finish: 'Lót', image_emoji: '🧴', sold: 187 },
  { id: 'p6', sku: 'JOT-GARDTEX-20KG', name: 'Bột Trét Ngoại Thất Gardtex 40KG', category: 'Bột trét', brand: 'Jotun', unit: 'Bao 40KG', price: 620000, cost_price: 470000, stock: 200, color_code: 'Trắng', finish: 'Mịn', image_emoji: '🏗️', sold: 421 },
  { id: 'p7', sku: 'JOT-PENGUARD-5L', name: 'Sơn Công Nghiệp Penguard 5L', category: 'Công nghiệp', brand: 'Penguard', unit: 'Bộ 5L', price: 1450000, cost_price: 1120000, stock: 24, color_code: 'Xám 1280', finish: 'Bóng', image_emoji: '🏭', sold: 54 },
  { id: 'p8', sku: 'JOT-WATERGUARD-6KG', name: 'Chống Thấm WaterGuard 6KG', category: 'Chống thấm', brand: 'WaterGuard', unit: 'Thùng 6KG', price: 980000, cost_price: 720000, stock: 67, color_code: 'Xám', finish: 'Mờ', image_emoji: '💧', sold: 163 },
];

export const mockCustomers = [
  { id: 'c1', name: 'Anh Tuấn - Thầu XD', phone: '0903 123 456', address: 'Q. Thủ Đức, TP.HCM', debt: 12500000, total_bought: 48200000, type: 'Thợ thầu' },
  { id: 'c2', name: 'Chị Lan - Gia đình', phone: '0918 555 222', address: 'Dĩ An, Bình Dương', debt: 0, total_bought: 8600000, type: 'Lẻ' },
  { id: 'c3', name: 'Công ty An Phát', phone: '028 3812 9999', address: 'KCN Sóng Thần', debt: 34000000, total_bought: 156000000, type: 'Công trình' },
  { id: 'c4', name: 'Anh Hùng - Đại lý cấp 2', phone: '0937 777 111', address: 'Biên Hòa, Đồng Nai', debt: 8000000, total_bought: 96500000, type: 'Đại lý' },
];

export const mockOrders = [
  { id: 'DH-2026-001', customer: 'Anh Tuấn - Thầu XD', items: 3, total: 8450000, status: 'Hoàn thành', payment: 'Chuyển khoản', date: '2026-09-29 14:30', profit: 1950000 },
  { id: 'DH-2026-002', customer: 'Chị Lan - Gia đình', items: 2, total: 2300000, status: 'Hoàn thành', payment: 'Tiền mặt', date: '2026-09-29 10:15', profit: 540000 },
  { id: 'DH-2026-003', customer: 'Công ty An Phát', items: 12, total: 42500000, status: 'Đang giao', payment: 'Công nợ', date: '2026-09-28 16:00', profit: 9800000 },
  { id: 'DH-2026-004', customer: 'Anh Hùng - Đại lý cấp 2', items: 8, total: 18900000, status: 'Hoàn thành', payment: 'Chuyển khoản', date: '2026-09-28 09:20', profit: 4300000 },
  { id: 'DH-2026-005', customer: 'Khách lẻ', items: 1, total: 1150000, status: 'Đã hủy', payment: 'Tiền mặt', date: '2026-09-27 15:45', profit: 0 },
];
