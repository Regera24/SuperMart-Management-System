// =============================================================================
// PRODUCT SERVICE (MongoDB) - smms_product_service
// Collections: categories, products
// =============================================================================
// Run: mongosh smms_product_service < 02_product_service.js

// ─── CATEGORIES ─────────────────────────────────────────────────────────────
db.categories.deleteMany({});
db.categories.insertMany([
  {
    _id: ObjectId("665a00000000000000000001"),
    name: "Thực phẩm tươi sống",
    slug: "thuc-pham-tuoi-song",
    parent_id: null,
    image_url: "https://supermart.vn/img/cat/tuoi-song.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  },
  {
    _id: ObjectId("665a00000000000000000002"),
    name: "Đồ uống",
    slug: "do-uong",
    parent_id: null,
    image_url: "https://supermart.vn/img/cat/do-uong.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  },
  {
    _id: ObjectId("665a00000000000000000003"),
    name: "Gia vị & Nước chấm",
    slug: "gia-vi-nuoc-cham",
    parent_id: null,
    image_url: "https://supermart.vn/img/cat/gia-vi.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  },
  {
    _id: ObjectId("665a00000000000000000004"),
    name: "Bánh kẹo",
    slug: "banh-keo",
    parent_id: null,
    image_url: "https://supermart.vn/img/cat/banh-keo.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  },
  {
    _id: ObjectId("665a00000000000000000005"),
    name: "Sữa & Sản phẩm từ sữa",
    slug: "sua-san-pham-tu-sua",
    parent_id: null,
    image_url: "https://supermart.vn/img/cat/sua.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  },
  // Sub-categories
  {
    _id: ObjectId("665a00000000000000000011"),
    name: "Thịt",
    slug: "thit",
    parent_id: "665a00000000000000000001",
    image_url: "https://supermart.vn/img/cat/thit.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  },
  {
    _id: ObjectId("665a00000000000000000012"),
    name: "Rau củ quả",
    slug: "rau-cu-qua",
    parent_id: "665a00000000000000000001",
    image_url: "https://supermart.vn/img/cat/rau-cu.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  },
  {
    _id: ObjectId("665a00000000000000000021"),
    name: "Nước ngọt",
    slug: "nuoc-ngot",
    parent_id: "665a00000000000000000002",
    image_url: "https://supermart.vn/img/cat/nuoc-ngot.jpg",
    created_at: ISODate("2025-01-15T08:00:00Z"),
    updated_at: ISODate("2025-01-15T08:00:00Z")
  }
]);

// ─── PRODUCTS ───────────────────────────────────────────────────────────────
// SKU format: CAT_PREFIX-XXXX (matches inventory-service & order-service product_sku)
db.products.deleteMany({});
db.products.insertMany([
  {
    _id: ObjectId("665b00000000000000000001"),
    sku: "MEAT-0001",
    name: "Thịt ba chỉ heo (500g)",
    slug: "thit-ba-chi-heo-500g",
    price: NumberDecimal("85000"),
    image_urls: ["https://supermart.vn/img/prod/thit-ba-chi.jpg"],
    category_ids: ["665a00000000000000000001", "665a00000000000000000011"],
    attributes: { weight: "500g", origin: "Việt Nam", storage: "2-5°C" },
    unit: "gói",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000002"),
    sku: "MEAT-0002",
    name: "Ức gà phi lê (400g)",
    slug: "uc-ga-phi-le-400g",
    price: NumberDecimal("55000"),
    image_urls: ["https://supermart.vn/img/prod/uc-ga.jpg"],
    category_ids: ["665a00000000000000000001", "665a00000000000000000011"],
    attributes: { weight: "400g", origin: "Việt Nam", storage: "2-5°C" },
    unit: "gói",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000003"),
    sku: "VEG-0001",
    name: "Cà chua (1kg)",
    slug: "ca-chua-1kg",
    price: NumberDecimal("25000"),
    image_urls: ["https://supermart.vn/img/prod/ca-chua.jpg"],
    category_ids: ["665a00000000000000000001", "665a00000000000000000012"],
    attributes: { weight: "1kg", origin: "Đà Lạt", type: "organic" },
    unit: "kg",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000004"),
    sku: "VEG-0002",
    name: "Rau muống (500g)",
    slug: "rau-muong-500g",
    price: NumberDecimal("12000"),
    image_urls: ["https://supermart.vn/img/prod/rau-muong.jpg"],
    category_ids: ["665a00000000000000000001", "665a00000000000000000012"],
    attributes: { weight: "500g", origin: "Củ Chi" },
    unit: "bó",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000005"),
    sku: "DRK-0001",
    name: "Coca Cola (lon 330ml)",
    slug: "coca-cola-lon-330ml",
    price: NumberDecimal("10000"),
    image_urls: ["https://supermart.vn/img/prod/coca-cola.jpg"],
    category_ids: ["665a00000000000000000002", "665a00000000000000000021"],
    attributes: { volume: "330ml", type: "carbonated" },
    unit: "lon",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000006"),
    sku: "DRK-0002",
    name: "Pepsi (lon 330ml)",
    slug: "pepsi-lon-330ml",
    price: NumberDecimal("10000"),
    image_urls: ["https://supermart.vn/img/prod/pepsi.jpg"],
    category_ids: ["665a00000000000000000002", "665a00000000000000000021"],
    attributes: { volume: "330ml", type: "carbonated" },
    unit: "lon",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000007"),
    sku: "SPC-0001",
    name: "Nước mắm Nam Ngư (500ml)",
    slug: "nuoc-mam-nam-ngu-500ml",
    price: NumberDecimal("28000"),
    image_urls: ["https://supermart.vn/img/prod/nuoc-mam.jpg"],
    category_ids: ["665a00000000000000000003"],
    attributes: { volume: "500ml", brand: "Nam Ngư" },
    unit: "chai",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000008"),
    sku: "SNK-0001",
    name: "Bánh Oreo (137g)",
    slug: "banh-oreo-137g",
    price: NumberDecimal("22000"),
    image_urls: ["https://supermart.vn/img/prod/oreo.jpg"],
    category_ids: ["665a00000000000000000004"],
    attributes: { weight: "137g", brand: "Oreo", flavor: "chocolate" },
    unit: "gói",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000009"),
    sku: "MLK-0001",
    name: "Sữa tươi Vinamilk 100% (1L)",
    slug: "sua-tuoi-vinamilk-1l",
    price: NumberDecimal("32000"),
    image_urls: ["https://supermart.vn/img/prod/vinamilk-1l.jpg"],
    category_ids: ["665a00000000000000000005"],
    attributes: { volume: "1L", brand: "Vinamilk", fat: "có đường" },
    unit: "hộp",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  },
  {
    _id: ObjectId("665b00000000000000000010"),
    sku: "MLK-0002",
    name: "Sữa chua Vinamilk có đường (hộp 4 hũ)",
    slug: "sua-chua-vinamilk-4-hu",
    price: NumberDecimal("26000"),
    image_urls: ["https://supermart.vn/img/prod/sua-chua-vinamilk.jpg"],
    category_ids: ["665a00000000000000000005"],
    attributes: { quantity: "4 hũ", brand: "Vinamilk" },
    unit: "lốc",
    is_active: true,
    created_at: ISODate("2025-02-01T10:00:00Z"),
    updated_at: ISODate("2025-02-01T10:00:00Z")
  }
]);

print("✅ Product Service: Inserted 8 categories + 10 products");
