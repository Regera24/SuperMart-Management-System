import api, { unwrap, unwrapPage } from "./client"

// GET /users?page&size&role&search → PageResponse<UserResponse>
export async function getUsers(params = {}) {
  const resp = await api.get("/users", { params })
  return unwrapPage(resp)
}

// POST /users → UserResponse
export async function createUser(data) {
  const resp = await api.post("/users", data)
  return unwrap(resp)
}

// PUT /users/:id → UserResponse
export async function updateUser(id, data) {
  const resp = await api.put(`/users/${id}`, data)
  return unwrap(resp)
}

// PATCH /users/:id/status → UserResponse
export async function updateUserStatus(id, status) {
  const resp = await api.patch(`/users/${id}/status`, { status })
  return unwrap(resp)
}
