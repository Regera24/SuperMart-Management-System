import api, { unwrap } from "./client"

// POST /api/auth/login → { accessToken, accessExpiresIn, refreshExpiresIn }
export async function login(username, password) {
  const resp = await api.post("/api/auth/login", { username, password })
  return unwrap(resp)
}

// POST /api/auth/refresh → { accessToken }
export async function refreshToken() {
  const resp = await api.post("/api/auth/refresh")
  return unwrap(resp)
}

// POST /api/auth/logout
export async function logout() {
  await api.post("/api/auth/logout")
}

// POST /api/auth/forgot-password → void
export async function forgotPassword(email) {
  await api.post("/api/auth/forgot-password", { email })
}

// POST /api/auth/reset-password → void
export async function resetPassword(email, otp, newPassword) {
  await api.post("/api/auth/reset-password", { email, otp, newPassword })
}

// PATCH /users/me/password → void
export async function changePassword(oldPassword, newPassword) {
  await api.patch("/users/me/password", { oldPassword, newPassword })
}
