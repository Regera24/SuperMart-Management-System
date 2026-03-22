import api, { unwrap } from "./client"

// POST /auth/login → { accessToken, refreshToken, accessExpiresIn, refreshExpiresIn }
export async function login(username, password) {
  const resp = await api.post("/auth/login", { username, password })
  return unwrap(resp)
}

// POST /auth/refresh → { accessToken, refreshToken }
export async function refreshToken(refreshToken) {
  const resp = await api.post("/auth/refresh", { refreshToken })
  return unwrap(resp)
}

// POST /auth/logout
export async function logout() {
  await api.post("/auth/logout")
}

// POST /auth/forgot-password → void
export async function forgotPassword(email) {
  await api.post("/auth/forgot-password", { email })
}

// POST /auth/reset-password → void
export async function resetPassword(email, otp, newPassword) {
  await api.post("/auth/reset-password", { email, otp, newPassword })
}

// PATCH /users/me/password → void
export async function changePassword(oldPassword, newPassword) {
  await api.patch("/users/me/password", { oldPassword, newPassword })
}
