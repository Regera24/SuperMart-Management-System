// =============================================================================
// NOTIFICATION SERVICE (MongoDB) - smms_notification_service
// Collections: notification_templates, notifications
// =============================================================================
// Run: mongosh smms_notification_service < 07_notification_service.js

db.notification_templates.deleteMany({});
db.notification_templates.insertMany([
  {
    _id: ObjectId("665c00000000000000000001"),
    code: "ORDER_COMPLETED",
    title: "Đơn hàng hoàn tất",
    bodyTemplate: "Đơn hàng {{orderCode}} đã hoàn tất. Tổng thanh toán: {{finalAmount}} VND.",
    channel: "SMS",
    isActive: true
  },
  {
    _id: ObjectId("665c00000000000000000002"),
    code: "ORDER_CANCELLED",
    title: "Đơn hàng bị huỷ",
    bodyTemplate: "Đơn hàng {{orderCode}} đã bị huỷ. Lý do: {{reason}}.",
    channel: "SMS",
    isActive: true
  },
  {
    _id: ObjectId("665c00000000000000000003"),
    code: "POINTS_EARNED",
    title: "Tích điểm thành công",
    bodyTemplate: "Bạn đã nhận {{points}} điểm từ đơn hàng {{orderCode}}. Tổng điểm: {{totalPoints}}.",
    channel: "PUSH",
    isActive: true
  },
  {
    _id: ObjectId("665c00000000000000000004"),
    code: "LOW_STOCK_ALERT",
    title: "Cảnh báo hết hàng",
    bodyTemplate: "Sản phẩm {{productSku}} tại kho {{warehouseName}} còn {{quantity}} đơn vị.",
    channel: "EMAIL",
    isActive: true
  },
  {
    _id: ObjectId("665c00000000000000000005"),
    code: "SHIFT_REMINDER",
    title: "Nhắc lịch ca làm việc",
    bodyTemplate: "Bạn có ca {{shiftName}} ngày {{workDate}}, giờ {{startTime}} - {{endTime}}.",
    channel: "PUSH",
    isActive: true
  },
  {
    _id: ObjectId("665c00000000000000000006"),
    code: "PAYROLL_READY",
    title: "Bảng lương đã sẵn sàng",
    bodyTemplate: "Bảng lương tháng {{month}}/{{year}} đã sẵn sàng. Lương thực nhận: {{finalSalary}} VND.",
    channel: "EMAIL",
    isActive: true
  }
]);

// recipientId references identity-service User.id
db.notifications.deleteMany({});
db.notifications.insertMany([
  {
    recipientId: "550e8400-e29b-41d4-a716-446655440003",
    type: "SMS",
    content: { orderCode: "ORD-20250301-0001", finalAmount: "500,000" },
    status: "SENT",
    retryCount: 0,
    errorMessage: null,
    createdAt: ISODate("2025-03-01T10:31:00Z"),
    sentAt: ISODate("2025-03-01T10:31:05Z")
  },
  {
    recipientId: "550e8400-e29b-41d4-a716-446655440003",
    type: "SMS",
    content: { orderCode: "ORD-20250316-0010", reason: "Khách huỷ" },
    status: "SENT",
    retryCount: 0,
    errorMessage: null,
    createdAt: ISODate("2025-03-16T08:01:00Z"),
    sentAt: ISODate("2025-03-16T08:01:03Z")
  },
  {
    recipientId: "550e8400-e29b-41d4-a716-446655440002",
    type: "EMAIL",
    content: { productSku: "MEAT-0001", warehouseName: "Kho chính - Quận 7", quantity: 120 },
    status: "SENT",
    retryCount: 0,
    errorMessage: null,
    createdAt: ISODate("2025-03-15T08:05:00Z"),
    sentAt: ISODate("2025-03-15T08:05:02Z")
  },
  {
    recipientId: "550e8400-e29b-41d4-a716-446655440003",
    type: "PUSH_APP",
    content: { shiftName: "Ca sáng", workDate: "2025-03-10", startTime: "06:00", endTime: "14:00" },
    status: "SENT",
    retryCount: 0,
    errorMessage: null,
    createdAt: ISODate("2025-03-09T20:00:00Z"),
    sentAt: ISODate("2025-03-09T20:00:01Z")
  },
  {
    recipientId: "550e8400-e29b-41d4-a716-446655440004",
    type: "EMAIL",
    content: { month: 2, year: 2025, finalSalary: "10,500,000" },
    status: "FAILED",
    retryCount: 3,
    errorMessage: "SMTP connection timeout",
    createdAt: ISODate("2025-03-05T09:00:00Z"),
    sentAt: null
  }
]);

print("✅ Notification Service: Inserted 6 templates + 5 notifications");
