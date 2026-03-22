-- =============================================================================
-- IDENTITY SERVICE (MySQL) - smms_identity_service
-- Tables: permission, role, User, hasRole, hasPermission
-- =============================================================================

USE smms_identity_service;

-- ─── PERMISSIONS ─────────────────────────────────────────────────────────────
INSERT INTO permission (id, name, description) VALUES
(1, 'USER_CREATE',       'Tạo tài khoản mới'),
(2, 'USER_READ',         'Xem thông tin tài khoản'),
(3, 'USER_UPDATE',       'Cập nhật tài khoản'),
(4, 'USER_DELETE',       'Xoá tài khoản'),
(5, 'PRODUCT_CREATE',    'Thêm sản phẩm'),
(6, 'PRODUCT_READ',      'Xem sản phẩm'),
(7, 'PRODUCT_UPDATE',    'Cập nhật sản phẩm'),
(8, 'PRODUCT_DELETE',    'Xoá sản phẩm'),
(9, 'ORDER_CREATE',      'Tạo đơn hàng'),
(10, 'ORDER_READ',       'Xem đơn hàng'),
(11, 'ORDER_UPDATE',     'Cập nhật đơn hàng'),
(12, 'ORDER_CANCEL',     'Huỷ đơn hàng'),
(13, 'INVENTORY_READ',   'Xem kho hàng'),
(14, 'INVENTORY_MANAGE', 'Quản lý kho hàng'),
(15, 'REPORT_VIEW',      'Xem báo cáo'),
(16, 'REPORT_CREATE',    'Tạo báo cáo'),
(17, 'STAFF_MANAGE',     'Quản lý nhân viên'),
(18, 'CUSTOMER_MANAGE',  'Quản lý khách hàng');

-- ─── ROLES ───────────────────────────────────────────────────────────────────
INSERT INTO role (id, name, description) VALUES
(1, 'ADMIN',   'Quản trị viên hệ thống - toàn quyền'),
(2, 'MANAGER', 'Quản lý cửa hàng - quản lý sản phẩm, kho, nhân viên, báo cáo'),
(3, 'CASHIER', 'Thu ngân - tạo đơn hàng, xem sản phẩm, quản lý khách hàng');

-- ─── ROLE-PERMISSION MAPPING (hasPermission) ────────────────────────────────
-- ADMIN has all permissions
INSERT INTO has_permission (permission_id, role_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1),
(10, 1), (11, 1), (12, 1), (13, 1), (14, 1), (15, 1), (16, 1), (17, 1), (18, 1);

-- MANAGER has most permissions except user management
INSERT INTO has_permission (permission_id, role_id) VALUES
(2, 2), (5, 2), (6, 2), (7, 2), (8, 2), (9, 2), (10, 2), (11, 2), (12, 2),
(13, 2), (14, 2), (15, 2), (16, 2), (17, 2), (18, 2);

-- CASHIER has limited permissions
INSERT INTO has_permission (permission_id, role_id) VALUES
(6, 3), (9, 3), (10, 3), (13, 3), (18, 3);

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Passwords: "password123" (plain text for testing; in production, these would be BCrypt hashed)
INSERT INTO user (id, username, password, email, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin',       'password123', 'admin@supermart.vn',       '0901000001'),
('550e8400-e29b-41d4-a716-446655440002', 'manager_huy', 'password123', 'huy.manager@supermart.vn', '0901000002'),
('550e8400-e29b-41d4-a716-446655440003', 'cashier_lan', 'password123', 'lan.cashier@supermart.vn', '0901000003'),
('550e8400-e29b-41d4-a716-446655440004', 'cashier_tuan','password123', 'tuan.cashier@supermart.vn','0901000004'),
('550e8400-e29b-41d4-a716-446655440005', 'manager_mai', 'password123', 'mai.manager@supermart.vn', '0901000005');

-- ─── USER-ROLE MAPPING (hasRole) ─────────────────────────────────────────────
INSERT INTO has_role (user_id, role_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1),  -- admin -> ADMIN
('550e8400-e29b-41d4-a716-446655440002', 2),  -- manager_huy -> MANAGER
('550e8400-e29b-41d4-a716-446655440003', 3),  -- cashier_lan -> CASHIER
('550e8400-e29b-41d4-a716-446655440004', 3),  -- cashier_tuan -> CASHIER
('550e8400-e29b-41d4-a716-446655440005', 2);  -- manager_mai -> MANAGER
