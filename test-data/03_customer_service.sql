-- =============================================================================
-- CUSTOMER SERVICE (PostgreSQL) - smms_customer_service
-- Tables: customers, loyalty_rules, point_transactions
-- =============================================================================

-- ─── CUSTOMERS ──────────────────────────────────────────────────────────────
-- current_points & total_spent phải khớp với tổng point_transactions & order final_amount
INSERT INTO customers (id, phone, full_name, dob, current_points, tier_level, total_spent, created_at, version) VALUES
(1, '0912345001', 'Nguyễn Văn An',    '1990-05-15', 150, 'SILVER',  2850000.0000, '2025-01-20 10:00:00', 0),
(2, '0912345002', 'Trần Thị Bích',    '1985-11-22', 520, 'GOLD',    8500000.0000, '2025-01-22 11:30:00', 0),
(3, '0912345003', 'Lê Hoàng Cường',   '1992-03-08', 1200,'DIAMOND', 25000000.0000,'2025-01-25 09:00:00', 0),
(4, '0912345004', 'Phạm Minh Đức',    '1998-07-30', 80,  'SILVER',  1200000.0000, '2025-02-01 14:00:00', 0),
(5, '0912345005', 'Hoàng Thị Ê',      '2000-01-10', 0,   'SILVER',  0.0000,       '2025-03-01 16:00:00', 0);

-- ─── LOYALTY RULES ──────────────────────────────────────────────────────────
-- pointConversionRate: cứ 1 đ -> x points
INSERT INTO loyalty_rules (id, name, point_conversion_rate, min_order_value, is_active, priority, start_date, end_date) VALUES
(1, 'Tích điểm cơ bản',     0.000100, 50000.0000,  true, 0, '2025-01-01 00:00:00', null),
(2, 'Khuyến mãi x2 Tết',   0.000200, 100000.0000, false, 1, '2025-01-25 00:00:00', '2025-02-10 23:59:59'),
(3, 'Ưu đãi thành viên Gold', 0.000150, 50000.0000, true, 2, '2025-01-01 00:00:00', null);

-- ─── POINT TRANSACTIONS ────────────────────────────────────────────────────
-- order_id phải trùng khớp với order_code trong order-service
-- points_amount: + cho EARN, - cho REDEEM
INSERT INTO point_transactions (id, customer_id, points_amount, type, order_id, transaction_date, description) VALUES
-- Customer 1 (An) - 150 points tổng
(1, 1,  100, 'EARN',   'ORD-20250301-0001', '2025-03-01 10:30:00', 'Tích điểm đơn hàng ORD-20250301-0001'),
(2, 1,   80, 'EARN',   'ORD-20250305-0002', '2025-03-05 14:20:00', 'Tích điểm đơn hàng ORD-20250305-0002'),
(3, 1,  -30, 'REDEEM', 'ORD-20250310-0005', '2025-03-10 09:15:00', 'Đổi điểm đơn hàng ORD-20250310-0005'),

-- Customer 2 (Bích) - 520 points tổng
(4, 2,  300, 'EARN',   'ORD-20250302-0003', '2025-03-02 11:00:00', 'Tích điểm đơn hàng ORD-20250302-0003'),
(5, 2,  250, 'EARN',   'ORD-20250308-0004', '2025-03-08 16:45:00', 'Tích điểm đơn hàng ORD-20250308-0004'),
(6, 2,  -30, 'REDEEM', NULL,                '2025-03-12 10:00:00', 'Đổi điểm lấy quà tặng'),

-- Customer 3 (Cường) - 1200 points tổng
(7, 3,  800, 'EARN',   'ORD-20250228-0006', '2025-02-28 09:30:00', 'Tích điểm đơn hàng ORD-20250228-0006'),
(8, 3,  500, 'EARN',   'ORD-20250310-0007', '2025-03-10 15:00:00', 'Tích điểm đơn hàng ORD-20250310-0007'),
(9, 3, -100, 'REDEEM', 'ORD-20250312-0008', '2025-03-12 11:30:00', 'Đổi điểm đơn hàng ORD-20250312-0008'),

-- Customer 4 (Đức) - 80 points tổng
(10, 4, 80,  'EARN',   'ORD-20250315-0009', '2025-03-15 13:00:00', 'Tích điểm đơn hàng ORD-20250315-0009');

-- Reset sequences
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('loyalty_rules_id_seq', (SELECT MAX(id) FROM loyalty_rules));
SELECT setval('point_transactions_id_seq', (SELECT MAX(id) FROM point_transactions));
