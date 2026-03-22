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
