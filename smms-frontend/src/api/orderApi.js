import api, { unwrap, unwrapPage } from "./client"

// POST /orders (checkout) → OrderResponse
export async function checkout(data) {
  const resp = await api.post("/orders", data)
  return unwrap(resp)
}

// GET /orders?page&size&status&cashierId&from&to → Page<OrderResponse>
export async function getOrders(params = {}) {
  const resp = await api.get("/orders", { params })
  return unwrapPage(resp)
}

// GET /orders/:id → OrderResponse
export async function getOrderById(id) {
  const resp = await api.get(`/orders/${id}`)
  return unwrap(resp)
}

// POST /orders/:id/cancel → OrderResponse
export async function cancelOrder(id) {
  const resp = await api.post(`/orders/${id}/cancel`)
  return unwrap(resp)
}
