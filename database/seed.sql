-- Seed dữ liệu mẫu sơn Jotun
insert into products (sku,name,category,brand,unit,price,cost_price,stock,color_code,finish) values
('JOT-JS-15L','Jotashield Ngoại Thất 15L','Ngoại thất','Jotashield','Thùng 15L',2850000,2300000,42,'Trắng 1001','Mờ'),
('JOT-MJ-5L','Majestic Nội Thất Bóng Mờ 5L','Nội thất','Majestic','Lon 5L',1150000,880000,86,'Kem 1024','Bóng mờ'),
('JOT-ES-18L','Essence Dễ Lau Chùi 18L','Nội thất','Essence','Thùng 18L',1980000,1520000,35,'Xanh Pastel 5452','Mờ'),
('JOT-JP-18L','Jotaplast Nội Thất 18L','Nội thất','Jotaplast','Thùng 18L',890000,640000,120,'Trắng sứ','Mờ'),
('JOT-SF-PRIMER-18L','Sơn Lót Chống Kiềm Majestic 18L','Sơn lót','Majestic','Thùng 18L',1750000,1350000,58,'Trắng','Lót'),
('JOT-GARDTEX-40KG','Bột Trét Ngoại Thất Gardtex 40KG','Bột trét','Jotun','Bao 40KG',620000,470000,200,'Trắng','Mịn'),
('JOT-PENGUARD-5L','Sơn Công Nghiệp Penguard 5L','Công nghiệp','Penguard','Bộ 5L',1450000,1120000,24,'Xám 1280','Bóng'),
('JOT-WATERGUARD-6KG','Chống Thấm WaterGuard 6KG','Chống thấm','WaterGuard','Thùng 6KG',980000,720000,67,'Xám','Mờ')
on conflict (sku) do nothing;

insert into customers (name,phone,address,type,debt,total_bought) values
('Anh Tuấn - Thầu XD','0903123456','Q. Thủ Đức, TP.HCM','Thợ thầu',12500000,48200000),
('Chị Lan - Gia đình','0918555222','Dĩ An, Bình Dương','Lẻ',0,8600000),
('Công ty An Phát','02838129999','KCN Sóng Thần','Công trình',34000000,156000000),
('Anh Hùng - Đại lý cấp 2','0937777111','Biên Hòa, Đồng Nai','Đại lý',8000000,96500000)
on conflict do nothing;
