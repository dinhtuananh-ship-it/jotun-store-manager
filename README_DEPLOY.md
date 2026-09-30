# Đại lý Sơn Jotun — Quản lý bán hàng (Neon + Vercel)

## 1. Tạo database Neon (2 phút)
1. Vào https://console.neon.tech → New Project → Region Singapore → Postgres 16
2. Copy `DATABASE_URL` (dạng `postgresql://...?sslmode=require`)
3. Vào SQL Editor → chạy toàn bộ `database/schema.sql` → sau đó `database/seed.sql`

## 2. Chạy local
```bash
cd jotun-store-manager
cp .env.example .env.local
# sửa DATABASE_URL trong .env.local
npm install
npm run dev
# mở http://localhost:3000 — login admin / jotun123
```

## 3. Deploy lên Vercel (1-click)
1. Push folder này lên GitHub (tạo repo mới, upload)
2. Vào https://vercel.com → Add New Project → Import repo
3. Framework: Next.js. Thêm Env Vars:
   - `DATABASE_URL` = chuỗi Neon
   - `ADMIN_USERNAME` = admin
   - `ADMIN_PASSWORD` = jotun123 (đổi mật khẩu thật)
   - `AUTH_SECRET` = chuỗi ngẫu nhiên
4. Deploy → có URL `https://xxx.vercel.app`

> Chưa có DATABASE_URL app vẫn chạy với dữ liệu mẫu (mode mock) để demo giao diện.

## 4. Tính năng
- Dashboard realtime, biểu đồ Recharts + hiệu ứng Framer Motion
- POS bán hàng: tìm kiếm, lọc loại sơn, giỏ hàng, chiết khấu thầu, in hóa đơn
- Sản phẩm: 8 mã sơn Jotun mẫu, thêm mới, cảnh báo tồn
- Kho: giá trị tồn, trạng thái Nhập gấp/Sắp hết/Đủ
- Đơn hàng, Khách hàng + công nợ, Báo cáo 6 tháng
- 1 tài khoản admin (không phân quyền nhân viên theo yêu cầu)

## 5. Mở rộng gợi ý
- Thêm NextAuth + roles, QR thanh toán, xuất Excel, Zalo OA thông báo nợ.
