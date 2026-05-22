-- =============================================================================
-- REPORT SERVICE (PostgreSQL) - smms_report
-- Table: reports
-- requestedBy references staff-service employee.id (accountId)
-- =============================================================================

INSERT INTO reports (id, type, title, parameters, result_url, status, period_from, period_to, requested_by, requested_at, completed_at) VALUES
(1, 'PAYROLL',    'Bảng lương tháng 02/2025',         '{"month":2,"year":2025}',                     '/reports/payroll_2025_02.pdf',    'COMPLETED', '2025-02-01', '2025-02-28', '1', '2025-03-05 10:00:00', '2025-03-05 10:02:00'),
(2, 'ATTENDANCE', 'Báo cáo chấm công 10-16/03/2025',  '{"from":"2025-03-10","to":"2025-03-16"}',     '/reports/attendance_w11.pdf',     'COMPLETED', '2025-03-10', '2025-03-16', '2', '2025-03-16 17:00:00', '2025-03-16 17:01:00'),
(3, 'INVENTORY',  'Báo cáo tồn kho tháng 03/2025',   '{"month":3,"year":2025,"warehouseId":1}',     '/reports/inventory_2025_03.xlsx', 'COMPLETED', '2025-03-01', '2025-03-31', '5', '2025-03-16 08:00:00', '2025-03-16 08:03:00'),
(4, 'PAYROLL',    'Bảng lương tháng 03/2025',         '{"month":3,"year":2025}',                     NULL,                             'PENDING',   '2025-03-01', '2025-03-31', '1', '2025-03-16 18:00:00', NULL),
(5, 'INVENTORY',  'Báo cáo nhập kho Q1/2025',         '{"quarter":1,"year":2025}',                   NULL,                             'FAILED',    '2025-01-01', '2025-03-31', '2', '2025-03-15 14:00:00', NULL);

SELECT setval('reports_id_seq', (SELECT MAX(id) FROM reports));
