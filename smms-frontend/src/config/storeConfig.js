/**
 * ===== CẤU HÌNH CỬA HÀNG =====
 * Chỉ cần sửa file này để thay đổi thông tin hiển thị trên Landing Page.
 * Không cần sửa code giao diện.
 */

const storeConfig = {
  // ── Thương hiệu ──────────────────────────────────────────
  name: "SuperMart",
  slogan: "Siêu thị tiện lợi — Chất lượng vượt trội",
  description:
    "SuperMart cung cấp đa dạng sản phẩm từ thực phẩm tươi sống, đồ gia dụng đến đồ điện tử với giá cả hợp lý và dịch vụ chuyên nghiệp. Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho mọi gia đình Việt.",
  heroImage:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=85",
  loginImage:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=85",
  experienceImages: [
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=900&q=80",
  ],

  // ── Giờ mở cửa ───────────────────────────────────────────
  businessHours: [
    { day: "Thứ Hai",  open: "07:00", close: "22:00", isOpen: true },
    { day: "Thứ Ba",   open: "07:00", close: "22:00", isOpen: true },
    { day: "Thứ Tư",   open: "07:00", close: "22:00", isOpen: true },
    { day: "Thứ Năm",  open: "07:00", close: "22:00", isOpen: true },
    { day: "Thứ Sáu",  open: "07:00", close: "22:00", isOpen: true },
    { day: "Thứ Bảy",  open: "07:00", close: "23:00", isOpen: true },
    { day: "Chủ Nhật", open: "08:00", close: "22:00", isOpen: true },
  ],

  // ── Địa chỉ & liên hệ ────────────────────────────────────
  address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
  phone: "028 1234 5678",
  email: "contact@supermart.vn",
  website: "https://supermart.vn",

  // Google Maps embed URL (thay bằng URL embed thực tế)
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0!2d106.7!3d10.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzQ4LjAiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1",

  // ── Mạng xã hội ──────────────────────────────────────────
  social: {
    facebook: "https://facebook.com/supermart",
    instagram: "https://instagram.com/supermart",
    zalo: "https://zalo.me/supermart",
  },

  // ── Số liệu nổi bật ──────────────────────────────────────
  stats: [
    { label: "Sản phẩm", value: "5,000+", icon: "Package" },
    { label: "Năm hoạt động", value: "10+", icon: "Award" },
    { label: "Khách hàng", value: "50,000+", icon: "Users" },
    { label: "Chi nhánh", value: "5", icon: "MapPin" },
  ],

  // ── Sản phẩm nổi bật ─────────────────────────────────────
  featuredProducts: [
    {
      name: "Gạo ST25",
      price: 185000,
      unit: "5kg",
      description: "Gạo thơm dẻo hạt dài — đạt giải gạo ngon nhất thế giới",
      badge: "Best Seller",
      emoji: "🌾",
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
      category: "Thực phẩm khô",
    },
    {
      name: "Sữa tươi Vinamilk",
      price: 32000,
      unit: "1L",
      description: "Sữa tươi tiệt trùng không đường — bổ sung canxi mỗi ngày",
      badge: "Bán chạy",
      emoji: "🥛",
      image:
        "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80",
      category: "Sữa & đồ uống",
    },
    {
      name: "Dầu ăn Neptune",
      price: 45000,
      unit: "1L",
      description: "Dầu ăn cao cấp chiết xuất từ đậu nành tự nhiên",
      badge: null,
      emoji: "🫒",
      image:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80",
      category: "Gia vị",
    },
    {
      name: "Mì Hảo Hảo",
      price: 4500,
      unit: "gói",
      description: "Mì ăn liền vị tôm chua cay — thương hiệu quốc dân",
      badge: "Hot",
      emoji: "🍜",
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
      category: "Ăn nhanh",
    },
    {
      name: "Nước mắm Phú Quốc",
      price: 78000,
      unit: "500ml",
      description: "Nước mắm truyền thống ủ 12 tháng, hương vị đậm đà",
      badge: "Premium",
      emoji: "🐟",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
      category: "Đặc sản",
    },
    {
      name: "Trà xanh Không Độ",
      price: 10000,
      unit: "500ml",
      description: "Trà xanh tự nhiên thanh mát, giải khát tức thì",
      badge: null,
      emoji: "🍵",
      image:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
      category: "Giải khát",
    },
  ],

  // ── Chính sách cửa hàng ───────────────────────────────────
  policies: [
    {
      title: "Giao hàng nhanh",
      description: "Giao hàng miễn phí trong bán kính 5km. Đơn trên 500K miễn phí ship toàn thành phố.",
      icon: "Truck",
    },
    {
      title: "Đổi trả dễ dàng",
      description: "Đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả. Hoàn tiền 100%.",
      icon: "RefreshCw",
    },
    {
      title: "Thanh toán linh hoạt",
      description: "Hỗ trợ tiền mặt, thẻ ngân hàng, ví MoMo, ZaloPay và chuyển khoản.",
      icon: "CreditCard",
    },
    {
      title: "Hàng chính hãng",
      description: "Cam kết 100% sản phẩm chính hãng, nguồn gốc rõ ràng, tem nhãn đầy đủ.",
      icon: "ShieldCheck",
    },
  ],

  // ── Năm thành lập (dùng cho footer) ──────────────────────
  foundedYear: 2015,
}

export default storeConfig
