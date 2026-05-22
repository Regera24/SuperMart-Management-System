-- =============================================================================
-- STAFF SERVICE (MySQL) - smms_staff_service
-- Tables: departments, employees, shifts, shift_schedules,
--         attendance_logs, leave_requests, payrolls
-- employee.account_id is a logical FK to identity-service
-- =============================================================================

INSERT INTO departments (id, name, description) VALUES
(1, 'Ban Giám Đốc',    'Quản lý điều hành siêu thị'),
(2, 'Thu Ngân',         'Bộ phận thu ngân, xử lý đơn hàng'),
(3, 'Kho vận',          'Quản lý kho hàng, nhập xuất'),
(4, 'Chăm sóc KH',     'Hỗ trợ và chăm sóc khách hàng');

-- account_id maps to identity-service user.id (UUID)
INSERT INTO employees (id, account_id, full_name, phone, email, address, tax_code, bank_account_number, base_salary, department_id) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', 'Nguyễn Admin',      '0901000001', 'admin@supermart.vn',       '1 Pasteur, Q.1, TP.HCM',      '8001234567', '19001001001', 30000000.00, 1),
(2, '550e8400-e29b-41d4-a716-446655440002', 'Trần Văn Huy',      '0901000002', 'huy.manager@supermart.vn', '22 Lê Lợi, Q.1, TP.HCM',      '8001234568', '19001001002', 18000000.00, 1),
(3, '550e8400-e29b-41d4-a716-446655440003', 'Lê Thị Lan',        '0901000003', 'lan.cashier@supermart.vn', '45 Nguyễn Trãi, Q.5, TP.HCM', '8001234569', '19001001003', 10000000.00, 2),
(4, '550e8400-e29b-41d4-a716-446655440004', 'Phạm Minh Tuấn',    '0901000004', 'tuan.cashier@supermart.vn','78 CMT8, Q.3, TP.HCM',         '8001234570', '19001001004', 10000000.00, 2),
(5, '550e8400-e29b-41d4-a716-446655440005', 'Đỗ Thị Mai',        '0901000005', 'mai.manager@supermart.vn', '12 Hai Bà Trưng, Q.1, TP.HCM','8001234571', '19001001005', 18000000.00, 3);

INSERT INTO shifts (id, shift_name, start_time, end_time, coefficient) VALUES
(1, 'Ca sáng',    '06:00:00', '14:00:00', 1.00),
(2, 'Ca chiều',   '14:00:00', '22:00:00', 1.00),
(3, 'Ca đêm',     '22:00:00', '06:00:00', 1.50),
(4, 'Ca hành chính', '08:00:00', '17:00:00', 1.00);

-- Lịch ca cho 1 tuần: 2025-03-10 → 2025-03-16
INSERT INTO shift_schedules (id, employee_id, shift_id, work_date) VALUES
(1,  3, 1, '2025-03-10'), (2,  3, 1, '2025-03-11'), (3,  3, 2, '2025-03-12'),
(4,  3, 1, '2025-03-13'), (5,  3, 2, '2025-03-14'),
(6,  4, 2, '2025-03-10'), (7,  4, 2, '2025-03-11'), (8,  4, 1, '2025-03-12'),
(9,  4, 2, '2025-03-13'), (10, 4, 1, '2025-03-14'),
(11, 2, 4, '2025-03-10'), (12, 2, 4, '2025-03-11'), (13, 2, 4, '2025-03-12'),
(14, 2, 4, '2025-03-13'), (15, 2, 4, '2025-03-14'),
(16, 5, 4, '2025-03-10'), (17, 5, 4, '2025-03-11'), (18, 5, 4, '2025-03-12'),
(19, 5, 4, '2025-03-13'), (20, 5, 4, '2025-03-14');

-- total_hours = TIMESTAMPDIFF between check_in and check_out
INSERT INTO attendance_logs (id, employee_id, shift_schedule_id, check_in_time, check_out_time, total_hours) VALUES
(1,  3, 1,  '2025-03-10 05:55:00', '2025-03-10 14:05:00', 8.17),
(2,  3, 2,  '2025-03-11 06:02:00', '2025-03-11 14:00:00', 7.97),
(3,  3, 3,  '2025-03-12 14:00:00', '2025-03-12 22:00:00', 8.00),
(4,  3, 4,  '2025-03-13 06:00:00', '2025-03-13 14:00:00', 8.00),
(5,  3, 5,  '2025-03-14 14:10:00', '2025-03-14 22:00:00', 7.83),
(6,  4, 6,  '2025-03-10 14:00:00', '2025-03-10 22:00:00', 8.00),
(7,  4, 7,  '2025-03-11 14:05:00', '2025-03-11 22:05:00', 8.00),
(8,  4, 8,  '2025-03-12 06:00:00', '2025-03-12 14:00:00', 8.00),
(9,  4, 9,  '2025-03-13 14:00:00', '2025-03-13 22:00:00', 8.00),
(10, 4, 10, '2025-03-14 06:00:00', '2025-03-14 14:00:00', 8.00),
(11, 2, 11, '2025-03-10 08:00:00', '2025-03-10 17:00:00', 9.00),
(12, 2, 12, '2025-03-11 08:00:00', '2025-03-11 17:00:00', 9.00),
(13, 2, 13, '2025-03-12 08:00:00', '2025-03-12 17:00:00', 9.00),
(14, 2, 14, '2025-03-13 08:00:00', '2025-03-13 17:00:00', 9.00),
(15, 2, 15, '2025-03-14 08:00:00', '2025-03-14 17:00:00', 9.00);

INSERT INTO leave_requests (id, employee_id, start_date, end_date, reason, status) VALUES
(1, 3, '2025-03-15 00:00:00', '2025-03-16 23:59:59', 'Việc gia đình',        'APPROVED'),
(2, 4, '2025-03-20 00:00:00', '2025-03-20 23:59:59', 'Khám bệnh',            'PENDING'),
(3, 5, '2025-03-25 00:00:00', '2025-03-28 23:59:59', 'Nghỉ phép năm',        'APPROVED'),
(4, 2, '2025-04-01 00:00:00', '2025-04-01 23:59:59', 'Công tác ngoài',        'REJECTED');

-- Payroll tháng 2/2025
-- final_salary = standard_salary + bonus - deduction
INSERT INTO payrolls (id, employee_id, month, year, total_work_hours, standard_salary, bonus, deduction, final_salary, status) VALUES
(1, 1, 2, 2025, 176.0, 30000000.00, 5000000.00, 0.00,       35000000.00, 'PAID'),
(2, 2, 2, 2025, 184.0, 18000000.00, 2000000.00, 0.00,       20000000.00, 'PAID'),
(3, 3, 2, 2025, 168.0, 10000000.00, 500000.00,  200000.00,  10300000.00, 'PAID'),
(4, 4, 2, 2025, 176.0, 10000000.00, 500000.00,  0.00,       10500000.00, 'PAID'),
(5, 5, 2, 2025, 176.0, 18000000.00, 1000000.00, 0.00,       19000000.00, 'PAID'),
-- Payroll tháng 3/2025 (draft)
(6, 1, 3, 2025, NULL,  30000000.00, NULL,        NULL,       NULL,        'DRAFT'),
(7, 2, 3, 2025, NULL,  18000000.00, NULL,        NULL,       NULL,        'DRAFT'),
(8, 3, 3, 2025, NULL,  10000000.00, NULL,        NULL,       NULL,        'DRAFT'),
(9, 4, 3, 2025, NULL,  10000000.00, NULL,        NULL,       NULL,        'DRAFT'),
(10,5, 3, 2025, NULL,  18000000.00, NULL,        NULL,       NULL,        'DRAFT');
