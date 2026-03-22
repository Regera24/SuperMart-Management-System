import api, { unwrap, unwrapPage } from "./client"

// GET /api/v1/notifications/recipient/:recipientId?page&size → Page<NotificationResponse>
export async function getNotifications(recipientId, params = {}) {
  const resp = await api.get(`/api/v1/notifications/recipient/${recipientId}`, { params })
  return unwrapPage(resp)
}

// POST /api/v1/notifications/send → NotificationResponse
export async function sendNotification(data) {
  const resp = await api.post("/api/v1/notifications/send", data)
  return unwrap(resp)
}
