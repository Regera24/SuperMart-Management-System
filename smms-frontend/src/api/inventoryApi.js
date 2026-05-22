import api, { unwrap, unwrapPage } from "./client"

// GET /inventory?warehouseId → List<StockResponse>
export async function getStock(warehouseId = 1) {
  const resp = await api.get("/inventory", { params: { warehouseId } })
  return unwrap(resp) || []
}

// GET /inventory/sku?warehouseId&sku → StockResponse
export async function getStockBySku(warehouseId, sku) {
  const resp = await api.get("/inventory/sku", { params: { warehouseId, sku } })
  return unwrap(resp)
}

// POST /inventory/adjust → StockResponse
export async function adjustStock(data) {
  const resp = await api.post("/inventory/adjust", data)
  return unwrap(resp)
}

// POST /inventory/deduct?warehouseId&sku&quantity&referenceId → StockResponse
export async function deductStock(warehouseId, sku, quantity, referenceId) {
  const resp = await api.post("/inventory/deduct", null, {
    params: { warehouseId, sku, quantity, referenceId },
  })
  return unwrap(resp)
}

// POST /inventory/restore?warehouseId&sku&quantity&referenceId → StockResponse
export async function restoreStock(warehouseId, sku, quantity, referenceId) {
  const resp = await api.post("/inventory/restore", null, {
    params: { warehouseId, sku, quantity, referenceId },
  })
  return unwrap(resp)
}

// GET /inventory/low-stock?threshold → List<LowStockAlertResponse>
export async function getLowStock(threshold = 10) {
  const resp = await api.get("/inventory/low-stock", { params: { threshold } })
  return unwrap(resp) || []
}

// ── Suppliers ──

export async function getSuppliers() {
  const resp = await api.get("/suppliers")
  return unwrap(resp) || []
}

export async function createSupplier(data) {
  const resp = await api.post("/suppliers", data)
  return unwrap(resp)
}

export async function updateSupplier(id, data) {
  const resp = await api.put(`/suppliers/${id}`, data)
  return unwrap(resp)
}

export async function deleteSupplier(id) {
  await api.delete(`/suppliers/${id}`)
}

// ── Warehouses ──

export async function getWarehouses() {
  const resp = await api.get("/warehouses")
  return unwrap(resp) || []
}

export async function createWarehouse(data) {
  const resp = await api.post("/warehouses", data)
  return unwrap(resp)
}

export async function updateWarehouse(id, data) {
  const resp = await api.put(`/warehouses/${id}`, data)
  return unwrap(resp)
}

// ── Import Receipts ──

export async function getImportReceipts(params = {}) {
  const resp = await api.get("/import-receipts", { params })
  return unwrapPage(resp)
}

export async function createImportReceipt(data) {
  const resp = await api.post("/import-receipts", data)
  return unwrap(resp)
}

export async function approveImportReceipt(id) {
  const resp = await api.post(`/import-receipts/${id}/approve`)
  return unwrap(resp)
}
