import api, { unwrap, unwrapPage } from "./client"

// POST /orders (checkout) → OrderResponse
export async function checkout(data) {
  const resp = await api.post("/orders", data)
  return unwrap(resp)
}

/**
 * Polls order status until it transitions from PENDING to a final state.
 * Returns the final OrderResponse with updated status.
 * @param {string} orderId - UUID of the order
 * @param {number} maxAttempts - max polling attempts (default 10)
 * @param {number} intervalMs - interval between polls in ms (default 1500)
 */
export async function pollOrderStatus(orderId, maxAttempts = 10, intervalMs = 1500) {
  const PENDING_STATES = ["PENDING", "STOCK_RESERVING"]
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs))
    try {
      const order = await getOrderById(orderId)
      if (!PENDING_STATES.includes(order.status)) {
        return order // Final state reached
      }
    } catch (e) {
      console.warn("Poll attempt failed:", e)
    }
  }
  // Timeout — return last known state
  try { return await getOrderById(orderId) } catch { return null }
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

// GET /orders/customer/:customerId?page&size → Page<OrderResponse>
export async function getOrdersByCustomer(customerId, params = {}) {
  const resp = await api.get(`/orders/customer/${customerId}`, { params })
  return unwrapPage(resp)
}

// GET /orders/statistics → OrderStatisticsResponse
export async function getOrderStatistics() {
  const resp = await api.get("/orders/statistics")
  return unwrap(resp)
}

