import api, { unwrap, unwrapPage } from "./client"

// GET /products?page&size&categoryId&isActive&keyword → Page<ProductResponse>
export async function getProducts(params = {}) {
  const resp = await api.get("/products", { params })
  return unwrapPage(resp)
}

// GET /products/:id → ProductResponse
export async function getProductById(id) {
  const resp = await api.get(`/products/${id}`)
  return unwrap(resp)
}

// GET /products/sku/:sku → ProductResponse
export async function getProductBySku(sku) {
  const resp = await api.get(`/products/sku/${sku}`)
  return unwrap(resp)
}

// POST /products → ProductResponse
export async function createProduct(data) {
  const resp = await api.post("/products", data)
  return unwrap(resp)
}

// POST /files/upload → List<String> (uploaded file URLs)
export async function uploadImages(files) {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  const resp = await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  })
  return unwrap(resp)
}

// PUT /products/:id → ProductResponse
export async function updateProduct(id, data) {
  const resp = await api.put(`/products/${id}`, data)
  return unwrap(resp)
}

// DELETE /products/:id → void
export async function deactivateProduct(id) {
  await api.delete(`/products/${id}`)
}

// === Categories ===

// GET /categories → List<CategoryResponse> (root categories)
export async function getRootCategories() {
  const resp = await api.get("/categories")
  return unwrap(resp) || []
}

// GET /categories/:id/children → List<CategoryResponse>
export async function getCategoryChildren(id) {
  const resp = await api.get(`/categories/${id}/children`)
  return unwrap(resp) || []
}

// GET /categories/:id → CategoryResponse
export async function getCategoryById(id) {
  const resp = await api.get(`/categories/${id}`)
  return unwrap(resp)
}

// POST /categories → CategoryResponse
export async function createCategory(data) {
  const resp = await api.post("/categories", data)
  return unwrap(resp)
}

// PUT /categories/:id → CategoryResponse
export async function updateCategory(id, data) {
  const resp = await api.put(`/categories/${id}`, data)
  return unwrap(resp)
}

// DELETE /categories/:id → void
export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`)
}
