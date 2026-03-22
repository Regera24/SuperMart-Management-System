# Test Data - SuperMart Management System

## Cách sử dụng

### Thứ tự chạy (quan trọng vì có cross-reference giữa các service)
1. `01_identity_service.sql` → MySQL (`smms_identity_service`)
2. `02_product_service.js` → MongoDB (`smms_product_service`)  
3. `03_customer_service.sql` → PostgreSQL (`smms_customer_service`)
4. `04_inventory_service.sql` → PostgreSQL (`smms_inventory_service`)
5. `05_order_service.sql` → PostgreSQL (`smms_order_service`)
6. `06_staff_service.sql` → MySQL (`smms_staff_service`)
7. `07_notification_service.js` → MongoDB (`smms_notification_service`)
8. `08_report_service.sql` → PostgreSQL (`smms_report`)

### Commands

```bash
# MySQL
mysql -u root -p12345 < test-data/01_identity_service.sql
mysql -u root -p12345 < test-data/06_staff_service.sql

# PostgreSQL
psql -U postgres -d smms_customer_service -f test-data/03_customer_service.sql
psql -U postgres -d smms_inventory_service -f test-data/04_inventory_service.sql
psql -U postgres -d smms_order_service -f test-data/05_order_service.sql
psql -U postgres -d smms_report -f test-data/08_report_service.sql

# MongoDB
mongosh smms_product_service test-data/02_product_service.js
mongosh smms_notification_service test-data/07_notification_service.js
```

## Cross-Service Data Map

| Dữ liệu | Nguồn | Tham chiếu bởi |
|----------|-------|----------------|
| User.id (UUID) | identity-service | order-service (cashierId), notification-service (recipientId) |
| Employee.accountId | staff-service | identity-service (User sequence), report-service (requestedBy) |
| Product.sku | product-service | inventory-service (product_sku), order-service (product_sku) |
| Order.orderCode | order-service | customer-service (PointTransaction.orderId), inventory-service (reference_id) |
