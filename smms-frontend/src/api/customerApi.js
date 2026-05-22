import api, { unwrap, unwrapPage } from "./client"

// GET /customers?page&size&search → Page<CustomerResponse>
export async function getCustomers(params = {}) {
  const resp = await api.get("/customers", { params })
  return unwrapPage(resp)
}

// GET /customers/:id → CustomerResponse
export async function getCustomerById(id) {
  const resp = await api.get(`/customers/${id}`)
  return unwrap(resp)
}

// GET /customers/phone/:phone → CustomerResponse
export async function getCustomerByPhone(phone) {
  const resp = await api.get(`/customers/phone/${phone}`)
  return unwrap(resp)
}

// POST /customers → CustomerResponse
export async function createCustomer(data) {
  const resp = await api.post("/customers", data)
  return unwrap(resp)
}

// PUT /customers/:id → CustomerResponse
export async function updateCustomer(id, data) {
  const resp = await api.put(`/customers/${id}`, data)
  return unwrap(resp)
}

// POST /customers/:id/points/add → void
export async function addPoints(id, points, referenceId) {
  await api.post(`/customers/${id}/points/add`, null, {
    params: { points, referenceId },
  })
}

// POST /customers/:id/points/deduct → void
export async function deductPoints(id, points, referenceId) {
  await api.post(`/customers/${id}/points/deduct`, null, {
    params: { points, referenceId },
  })
}

// ── Points History ──

// GET /customers/:id/points/history?page&size → Page<PointTransactionResponse>
export async function getPointHistory(id, params = {}) {
  const resp = await api.get(`/customers/${id}/points/history`, { params })
  return unwrapPage(resp)
}

// ── Loyalty Rules ──

export async function getLoyaltyRules() {
  const resp = await api.get("/loyalty-rules")
  return unwrap(resp) || []
}

export async function createLoyaltyRule(data) {
  const resp = await api.post("/loyalty-rules", data)
  return unwrap(resp)
}

export async function updateLoyaltyRule(id, data) {
  const resp = await api.put(`/loyalty-rules/${id}`, data)
  return unwrap(resp)
}

export async function deleteLoyaltyRule(id) {
  await api.delete(`/loyalty-rules/${id}`)
}

// ── Tier Configs (Rank-based discount) ──

export async function getTierConfigs() {
  const resp = await api.get("/tier-configs")
  return unwrap(resp) || []
}

export async function updateTierConfig(tierLevel, data) {
  const resp = await api.put(`/tier-configs/${tierLevel}`, data)
  return unwrap(resp)
}

export async function getTierDiscount(tierLevel) {
  const resp = await api.get("/tier-configs/discount", { params: { tierLevel } })
  return unwrap(resp)
}

// POST /customers/:id/earn-from-order?orderAmount&orderCode → int (points earned)
export async function earnFromOrder(customerId, orderAmount, orderCode) {
  const resp = await api.post(`/customers/${customerId}/earn-from-order`, null, {
    params: { orderAmount, orderCode },
  })
  return unwrap(resp) // returns integer points earned
}
