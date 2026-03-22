-- =============================================================================
-- INVENTORY SERVICE (PostgreSQL) - smms_inventory_service
-- =============================================================================

INSERT INTO warehouses (id, name, location) VALUES
(1, 'Kho chính - Quận 7', '123 Nguyễn Hữu Thọ, Q.7, TP.HCM'),
(2, 'Kho phụ - Thủ Đức',  '456 Võ Văn Ngân, Thủ Đức, TP.HCM');

INSERT INTO suppliers (id, name, contact_info) VALUES
(1, 'CT TNHH Thực Phẩm Sài Gòn', '{"phone":"0283123456","email":"sales@sgfood.vn"}'),
(2, 'CT CP Đồ Uống Việt Nam',     '{"phone":"0287654321","email":"order@vndrink.com"}'),
(3, 'Vinamilk - CN Miền Nam',      '{"phone":"0281234567","email":"b2b@vinamilk.com.vn"}');

-- product_sku matches product-service SKUs
INSERT INTO products_stock (id, warehouse_id, product_sku, quantity_on_hand, reserved_quantity) VALUES
(1,  1, 'MEAT-0001', 120, 5),
(2,  1, 'MEAT-0002', 80,  3),
(3,  1, 'VEG-0001',  200, 0),
(4,  1, 'VEG-0002',  150, 0),
(5,  1, 'DRK-0001',  500, 10),
(6,  1, 'DRK-0002',  480, 0),
(7,  1, 'SPC-0001',  90,  0),
(8,  1, 'SNK-0001',  200, 0),
(9,  1, 'MLK-0001',  160, 5),
(10, 1, 'MLK-0002',  140, 0),
(11, 2, 'MEAT-0001', 50,  0),
(12, 2, 'DRK-0001',  300, 0),
(13, 2, 'DRK-0002',  250, 0),
(14, 2, 'MLK-0001',  80,  0),
(15, 2, 'SNK-0001',  100, 0);

-- total_amount = SUM(details.quantity * details.import_price)
INSERT INTO import_receipts (id, supplier_id, warehouse_id, total_amount, status, created_at) VALUES
(1, 1, 1, 15500000.0000, 'COMPLETED', '2025-02-10 09:00:00'),
(2, 2, 1,  9800000.0000, 'COMPLETED', '2025-02-12 10:00:00'),
(3, 3, 1,  8320000.0000, 'COMPLETED', '2025-02-15 08:00:00'),
(4, 1, 2,  5000000.0000, 'COMPLETED', '2025-02-20 11:00:00'),
(5, 2, 2,  5500000.0000, 'COMPLETED', '2025-02-22 09:00:00'),
(6, 3, 2,  3300000.0000, 'DRAFT',     '2025-03-10 14:00:00');

INSERT INTO import_details (id, import_receipt_id, product_sku, quantity, import_price) VALUES
(1,  1, 'MEAT-0001', 150, 65000.0000),
(2,  1, 'MEAT-0002', 100, 40000.0000),
(3,  1, 'VEG-0001',  200,  5000.0000),
(4,  1, 'VEG-0002',  150,  5000.0000),
(5,  2, 'DRK-0001',  600,  7000.0000),
(6,  2, 'DRK-0002',  560,  7000.0000),
(7,  2, 'SPC-0001',  100, 16800.0000),
(8,  3, 'MLK-0001',  200, 24000.0000),
(9,  3, 'MLK-0002',  160, 18000.0000),
(10, 3, 'SNK-0001',  200,  3200.0000),
(11, 4, 'MEAT-0001',  50, 65000.0000),
(12, 4, 'MEAT-0002',  50, 35000.0000),
(13, 5, 'DRK-0001',  300,  7000.0000),
(14, 5, 'DRK-0002',  250,  7000.0000),
(15, 5, 'SNK-0001',  100, 16500.0000),
(16, 6, 'MLK-0001',  100, 24000.0000),
(17, 6, 'MLK-0002',   50, 18000.0000);

-- IMPORT positive, SALE negative; reference_id = order_code or import receipt ref
INSERT INTO inventory_transactions (id, warehouse_id, product_sku, quantity_change, type, reference_id, created_at) VALUES
(1,  1, 'MEAT-0001',  150, 'IMPORT', 'IR-1', '2025-02-10 09:05:00'),
(2,  1, 'MEAT-0002',  100, 'IMPORT', 'IR-1', '2025-02-10 09:05:00'),
(3,  1, 'VEG-0001',   200, 'IMPORT', 'IR-1', '2025-02-10 09:05:00'),
(4,  1, 'VEG-0002',   150, 'IMPORT', 'IR-1', '2025-02-10 09:05:00'),
(5,  1, 'DRK-0001',   600, 'IMPORT', 'IR-2', '2025-02-12 10:05:00'),
(6,  1, 'DRK-0002',   560, 'IMPORT', 'IR-2', '2025-02-12 10:05:00'),
(7,  1, 'SPC-0001',   100, 'IMPORT', 'IR-2', '2025-02-12 10:05:00'),
(8,  1, 'MLK-0001',   200, 'IMPORT', 'IR-3', '2025-02-15 08:05:00'),
(9,  1, 'MLK-0002',   160, 'IMPORT', 'IR-3', '2025-02-15 08:05:00'),
(10, 1, 'SNK-0001',   200, 'IMPORT', 'IR-3', '2025-02-15 08:05:00'),
(11, 2, 'MEAT-0001',   50, 'IMPORT', 'IR-4', '2025-02-20 11:05:00'),
(12, 2, 'MEAT-0002',   50, 'IMPORT', 'IR-4', '2025-02-20 11:05:00'),
(13, 2, 'DRK-0001',   300, 'IMPORT', 'IR-5', '2025-02-22 09:05:00'),
(14, 2, 'DRK-0002',   250, 'IMPORT', 'IR-5', '2025-02-22 09:05:00'),
(15, 2, 'SNK-0001',   100, 'IMPORT', 'IR-5', '2025-02-22 09:05:00'),
-- SALE transactions (order_code references order-service)
(16, 1, 'MEAT-0001',   -5, 'SALE', 'ORD-20250301-0001', '2025-03-01 10:30:00'),
(17, 1, 'DRK-0001',  -10,  'SALE', 'ORD-20250301-0001', '2025-03-01 10:30:00'),
(18, 1, 'MEAT-0002', -10,  'SALE', 'ORD-20250305-0002', '2025-03-05 14:20:00'),
(19, 1, 'MLK-0001',  -20,  'SALE', 'ORD-20250305-0002', '2025-03-05 14:20:00'),
(20, 1, 'DRK-0001',  -50,  'SALE', 'ORD-20250302-0003', '2025-03-02 11:00:00'),
(21, 1, 'DRK-0002',  -40,  'SALE', 'ORD-20250302-0003', '2025-03-02 11:00:00'),
-- RETURN
(22, 1, 'DRK-0001',    5, 'RETURN', 'ORD-20250302-0003', '2025-03-04 09:00:00'),
-- DAMAGED
(23, 1, 'MEAT-0001', -15, 'DAMAGED', 'DMG-20250315', '2025-03-15 08:00:00');

SELECT setval('warehouses_id_seq', (SELECT MAX(id) FROM warehouses));
SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));
SELECT setval('products_stock_id_seq', (SELECT MAX(id) FROM products_stock));
SELECT setval('import_receipts_id_seq', (SELECT MAX(id) FROM import_receipts));
SELECT setval('import_details_id_seq', (SELECT MAX(id) FROM import_details));
SELECT setval('inventory_transactions_id_seq', (SELECT MAX(id) FROM inventory_transactions));
