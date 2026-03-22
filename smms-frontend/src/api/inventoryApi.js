import api, { unwrap } from "./client"

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
