import axios from "axios"

// Trong dev mode, Vite proxy xử lý routing → dùng relative URL
// Trong production, trỏ tới API Gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || ""

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

// Request interceptor — thêm JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smms-token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — xử lý refresh token + errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Bỏ qua interceptor cho các auth endpoints — lỗi 401 ở đây là expected (sai mật khẩu, v.v.)
    const authPaths = ["/auth/login", "/auth/refresh", "/auth/forgot-password", "/auth/reset-password"]
    if (authPaths.some((p) => originalRequest.url?.includes(p))) {
      return Promise.reject(error)
    }

    // 401 → thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem("smms-refresh-token")

      if (refreshToken) {
        try {
          const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefresh } = resp.data.data
          localStorage.setItem("smms-token", accessToken)
          if (newRefresh) localStorage.setItem("smms-refresh-token", newRefresh)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch {
          // Refresh failed → logout
          localStorage.removeItem("smms-token")
          localStorage.removeItem("smms-refresh-token")
          localStorage.removeItem("smms-user")
          window.location.href = "/login"
          return Promise.reject(error)
        }
      }

      // No refresh token → logout
      localStorage.removeItem("smms-token")
      localStorage.removeItem("smms-user")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

// Helper: unwrap ApiResponse { code, message, data }
export function unwrap(response) {
  return response.data?.data
}

// Helper: unwrap paginated response  
// Supports cả PageResponse {content,page,size,totalElements,totalPages}
// và Spring Page {content,number,size,totalElements,totalPages}
export function unwrapPage(response) {
  const page = response.data?.data
  if (!page) return { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }
  return {
    content: page.content || [],
    page: page.page ?? page.number ?? 0,
    size: page.size || 20,
    totalElements: page.totalElements || 0,
    totalPages: page.totalPages || 0,
  }
}

export default api
