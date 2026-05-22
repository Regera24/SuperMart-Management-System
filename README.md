# SMMS - Sales & Store Management Microservices System

SMMS là hệ thống quản lý bán hàng và cửa hàng được xây dựng theo kiến trúc microservices. Dự án hỗ trợ các nghiệp vụ chính như quản lý tài khoản, sản phẩm, tồn kho, đơn hàng, khách hàng, nhân sự, thông báo và báo cáo. Frontend sử dụng React/Vite, backend gồm nhiều service Spring Boot giao tiếp thông qua API Gateway và Eureka Service Discovery.

## Mục tiêu dự án

- Số hóa quy trình quản lý cửa hàng/bán hàng từ sản phẩm, tồn kho đến đơn hàng và khách hàng.
- Tách hệ thống thành các service độc lập để dễ phát triển, bảo trì và mở rộng.
- Cung cấp giao diện web trực quan cho nhân viên/quản trị viên thao tác nghiệp vụ.
- Hỗ trợ thống kê, báo cáo, xuất dữ liệu và in hóa đơn phục vụ vận hành.

## Kiến trúc tổng quan

```text
smms-frontend
      |
      v
api-gateway :8080
      |
      +--> identity-service     :8082
      +--> order-service        :8084
      +--> product-service      :8086
      +--> inventory-service    :...
      +--> customer-service     :...
      +--> staff-service        :...
      +--> notification-service :...
      +--> report-service       :8088
      |
      v
eureka-server :8761
```

Các service backend đăng ký với `eureka-server`. Frontend gọi API thông qua `api-gateway`, gateway định tuyến request đến service tương ứng và có cấu hình Circuit Breaker/Fallback cho từng nhóm service.

## Tech stack

### Frontend

- React 19
- Vite 8
- React Router DOM 7
- Tailwind CSS 4
- Radix UI
- Lucide React
- Axios
- Recharts
- Sonner
- jsPDF, jsPDF AutoTable
- XLSX, File Saver
- ESLint

### Backend

- Java 21
- Spring Boot
- Spring Cloud
- Spring Cloud Gateway WebFlux
- Netflix Eureka Server/Client
- Spring Security
- OAuth2 Resource Server/JWT
- Spring Data JPA
- OpenFeign
- Resilience4j Circuit Breaker/Retry/TimeLimiter
- Maven Wrapper
- Lombok
- ModelMapper
- Bean Validation
- Actuator

### Database & infrastructure

- MySQL: dùng cho `identity-service`
- PostgreSQL: dùng cho các service nghiệp vụ như `order-service`, `report-service` và các service liên quan
- MongoDB: dùng cho `product-service`
- Redis: dùng trong `identity-service`
- Kafka: dùng trong luồng xử lý sự kiện của `order-service`
- Eureka: service discovery

## Các service chính

| Service | Vai trò |
| --- | --- |
| `eureka-server` | Service discovery, nơi các microservice đăng ký và tìm nhau. |
| `api-gateway` | Cổng API tập trung, định tuyến request, bảo vệ endpoint và fallback khi service lỗi. |
| `identity-service` | Xác thực, đăng nhập, refresh token, logout, quên/đặt lại mật khẩu, quản lý user. |
| `product-service` | Quản lý sản phẩm, danh mục, SKU và upload/lấy file. |
| `inventory-service` | Quản lý tồn kho, nhà cung cấp, kho hàng, phiếu nhập, điều chỉnh/trừ/khôi phục tồn kho. |
| `order-service` | Tạo đơn hàng, thống kê đơn hàng, xem lịch sử đơn theo khách hàng, hủy đơn và tích hợp tồn kho. |
| `customer-service` | Quản lý khách hàng, điểm thưởng, lịch sử điểm, quy tắc loyalty và cấu hình hạng khách hàng. |
| `staff-service` | Quản lý nhân viên, phòng ban, chấm công, ca làm, nghỉ phép và lương. |
| `notification-service` | Gửi và tra cứu thông báo theo người nhận. |
| `report-service` | Tạo, tra cứu và tải báo cáo; hỗ trợ lấy dữ liệu đơn hàng/tồn kho qua Feign. |

## Tính năng nổi bật

### Quản lý tài khoản và phân quyền

- Đăng nhập bằng JWT.
- Refresh token và logout.
- Quên mật khẩu, đặt lại mật khẩu.
- Quản lý người dùng và vai trò/quyền hạn.
- API Gateway xác thực request bằng JWT secret đồng bộ với identity service.

### Quản lý sản phẩm

- CRUD sản phẩm.
- Tìm sản phẩm theo SKU.
- Quản lý danh mục và danh mục con.
- Upload và truy xuất file liên quan đến sản phẩm.
- Lưu dữ liệu sản phẩm trên MongoDB.

### Quản lý kho

- Theo dõi tồn kho theo sản phẩm/SKU.
- Điều chỉnh tồn kho thủ công.
- Trừ kho khi phát sinh đơn hàng.
- Khôi phục tồn kho khi hủy đơn hoặc rollback nghiệp vụ.
- Cảnh báo danh sách sản phẩm sắp hết hàng.
- Quản lý nhà cung cấp, kho hàng và phiếu nhập.
- Duyệt phiếu nhập để cập nhật tồn kho.

### Quản lý đơn hàng

- Tạo đơn hàng.
- Xem danh sách và chi tiết đơn hàng.
- Hủy đơn hàng.
- Thống kê đơn hàng.
- Tra cứu đơn hàng theo khách hàng.
- Tích hợp inventory service để kiểm tra/trừ/khôi phục tồn kho.
- Có cấu hình Kafka, Feign, Retry và Circuit Breaker để tăng độ tin cậy.

### Quản lý khách hàng và loyalty

- CRUD khách hàng.
- Tìm khách hàng theo số điện thoại.
- Cộng/trừ điểm thưởng.
- Xem lịch sử điểm.
- Tính điểm từ đơn hàng.
- Quản lý quy tắc loyalty.
- Cấu hình hạng khách hàng và mức giảm giá theo hạng.

### Quản lý nhân sự

- Quản lý nhân viên và phòng ban.
- Chấm công check-in/check-out.
- Quản lý ca làm và phân ca.
- Quản lý đơn nghỉ phép, duyệt/từ chối nghỉ phép.
- Tạo bảng lương, xem lương cá nhân và đánh dấu đã thanh toán.

### Báo cáo, xuất file và in hóa đơn

- Tạo báo cáo theo request.
- Xem danh sách báo cáo và báo cáo theo người yêu cầu.
- Tải báo cáo.
- Frontend có hỗ trợ thư viện `jsPDF`, `jspdf-autotable`, `xlsx` và `file-saver` để xuất PDF/Excel, in hóa đơn và xử lý file báo cáo.

### Độ tin cậy hệ thống

- API Gateway dùng Circuit Breaker cho từng service.
- Fallback endpoint riêng cho identity, product, inventory, order, customer, staff, notification và report.
- Các service có Actuator health/info/metrics để kiểm tra trạng thái.
- Eureka hỗ trợ service discovery và load-balanced routing.

## Cấu trúc thư mục

```text
SMMS/
├── api-gateway/
├── customer-service/
├── eureka-server/
├── identity-service/
├── inventory-service/
├── notification-service/
├── order-service/
├── product-service/
├── report-service/
├── staff-service/
├── smms-frontend/
└── test-data/
```

## Yêu cầu cài đặt

Trước khi chạy dự án, cần cài đặt:

- Java 21
- Node.js 20+ hoặc phiên bản tương thích với Vite 8
- npm
- MySQL
- PostgreSQL
- MongoDB
- Redis
- Kafka
- Git

Không bắt buộc cài Maven global vì mỗi backend service đã có Maven Wrapper (`mvnw`, `mvnw.cmd`).

## Cấu hình database và service phụ thuộc

Các service có giá trị mặc định trong `application.yml`, có thể override bằng biến môi trường.

### MySQL

Dùng cho `identity-service`:

```sql
CREATE DATABASE smms_identity_service;
```

Mặc định:

```text
URL: jdbc:mysql://localhost:3306/smms_identity_service
Username: root
Password: 12345
```

Có thể override:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/smms_identity_service"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="12345"
```

### PostgreSQL

Một số service dùng PostgreSQL, ví dụ:

```sql
CREATE DATABASE smms_order_service;
CREATE DATABASE smms_report_service;
```

Mặc định trong các service đã đọc được:

```text
URL: jdbc:postgresql://localhost:5433/<database_name>
Username: postgres
Password: 12345
```

Có thể override:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5433/smms_order_service"
$env:DB_USER="postgres"
$env:DB_PASSWORD="12345"
```

Lưu ý: mỗi service dùng PostgreSQL nên có database riêng theo tên service.

### MongoDB

Dùng cho `product-service`:

```text
mongodb://localhost:27017/smms_product_service
```

Có thể override:

```powershell
$env:MONGO_URI="mongodb://localhost:27017/smms_product_service"
```

### Redis

Dùng trong `identity-service`:

```text
Host: localhost
Port: 6379
```

Có thể override:

```powershell
$env:SPRING_REDIS_HOST="localhost"
$env:SPRING_REDIS_PORT="6379"
```

### Kafka

Dùng trong `order-service`:

```text
localhost:9092
```

Có thể override:

```powershell
$env:KAFKA_BOOTSTRAP_SERVERS="localhost:9092"
```

### Eureka URL

Các service mặc định kết nối Eureka tại:

```text
http://localhost:8761/eureka
```

Có thể override:

```powershell
$env:EUREKA_URL="http://localhost:8761/eureka"
```

### JWT secret

Gateway và các service dùng chung JWT secret. Có thể override:

```powershell
$env:JWT_SECRET="your-secure-jwt-secret"
$env:JWT_REFRESH="your-secure-refresh-secret"
```

Khi deploy thật, không nên dùng secret mặc định trong file cấu hình.

## Hướng dẫn chạy backend

Nên chạy theo thứ tự:

1. Chạy database và infrastructure: MySQL, PostgreSQL, MongoDB, Redis, Kafka.
2. Chạy `eureka-server`.
3. Chạy các business service.
4. Chạy `api-gateway`.
5. Chạy frontend.

### 1. Chạy Eureka Server

```powershell
cd eureka-server
.\mvnw.cmd spring-boot:run
```

Eureka chạy tại:

```text
http://localhost:8761
```

### 2. Chạy các backend service

Mở terminal riêng cho từng service:

```powershell
cd identity-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd product-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd inventory-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd order-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd customer-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd staff-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd notification-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd report-service
.\mvnw.cmd spring-boot:run
```

### 3. Chạy API Gateway

```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run
```

Gateway chạy tại:

```text
http://localhost:8080
```

## Hướng dẫn chạy frontend

```powershell
cd smms-frontend
npm install
npm run dev
```

Frontend Vite thường chạy tại:

```text
http://localhost:5173
```

Build production:

```powershell
npm run build
```

Preview bản build:

```powershell
npm run preview
```

Kiểm tra lint:

```powershell
npm run lint
```

## Một số endpoint chính

Thông qua API Gateway `http://localhost:8080`:

| Nhóm | Endpoint |
| --- | --- |
| Auth | `/auth/**` |
| Users | `/users/**` |
| Products | `/products/**` |
| Categories | `/categories/**` |
| Files | `/files/**` |
| Inventory | `/inventory/**` |
| Suppliers | `/suppliers/**` |
| Warehouses | `/warehouses/**` |
| Import receipts | `/import-receipts/**` |
| Orders | `/orders/**` |
| Customers | `/customers/**` |
| Loyalty rules | `/loyalty-rules/**` |
| Tier configs | `/tier-configs/**` |
| Staff | `/api/v1/staff/**` |
| Notifications | `/api/v1/notifications/**` |
| Reports | `/api/v1/reports/**` |

## Kiểm tra trạng thái service

Một số service expose Actuator endpoint:

```text
/actuator/health
/actuator/info
/actuator/metrics
```

Ví dụ:

```text
http://localhost:8080/actuator/health
http://localhost:8761
```

Ngoài ra có thể kiểm tra Eureka Dashboard tại `http://localhost:8761` để xem service đã đăng ký hay chưa.

## Gợi ý quy trình phát triển

1. Pull code mới nhất từ repository.
2. Chạy database/infrastructure cần thiết.
3. Chạy Eureka trước.
4. Chạy service đang phát triển và các service phụ thuộc.
5. Chạy API Gateway.
6. Chạy frontend.
7. Kiểm tra luồng nghiệp vụ trên giao diện.
8. Chạy lint/build trước khi commit.

## Lỗi thường gặp

### Service không xuất hiện trên Eureka

- Kiểm tra `eureka-server` đã chạy ở port `8761`.
- Kiểm tra biến `EUREKA_URL`.
- Kiểm tra log service có lỗi kết nối Eureka hay không.

### Gateway trả fallback hoặc không gọi được service

- Kiểm tra service đích đã chạy và đã đăng ký Eureka.
- Kiểm tra route trong `api-gateway/src/main/resources/application.yml`.
- Kiểm tra token JWT nếu endpoint yêu cầu xác thực.

### Backend không kết nối được database

- Kiểm tra database đã chạy.
- Kiểm tra database đã được tạo.
- Kiểm tra username/password/port.
- Kiểm tra biến môi trường override đúng service hay chưa.

### Frontend không gọi được API

- Kiểm tra `api-gateway` đang chạy tại port `8080`.
- Kiểm tra CORS và URL API trong frontend.
- Kiểm tra token đăng nhập nếu API yêu cầu xác thực.

## Ghi chú bảo mật

- Không dùng JWT secret mặc định khi deploy production.
- Không commit mật khẩu database thật hoặc secret thật lên repository.
- Nên cấu hình biến môi trường hoặc secret manager cho môi trường production.
- Nên giới hạn quyền truy cập database theo từng service.

