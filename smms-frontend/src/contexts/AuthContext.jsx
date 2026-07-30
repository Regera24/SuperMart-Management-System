import { createContext, useContext, useState, useCallback } from "react"
import * as authApi from "@/api/authApi"

const AuthContext = createContext(null)

// Decode JWT payload to extract user info
function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.sub || payload.userId,
      username: payload.username || payload.preferred_username || payload.sub,
      email: payload.email || "",
      phone: payload.phone || "",
      roles: payload.roles || payload.scope?.split(" ") || [],
      fullName: payload.fullName || payload.name || payload.username || payload.sub,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("smms-user")
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem("smms-token"))

  const login = useCallback(async (username, password) => {
    try {
      const tokenData = await authApi.login(username, password)
      const { accessToken } = tokenData

      // Decode JWT để lấy user info
      const userInfo = decodeJwt(accessToken) || { id: username, username, roles: [], fullName: username }

      setUser(userInfo)
      setToken(accessToken)
      localStorage.setItem("smms-user", JSON.stringify(userInfo))
      localStorage.setItem("smms-token", accessToken)
      localStorage.removeItem("smms-refresh-token")

      return { success: true, user: userInfo }
    } catch (err) {
      const message = err.response?.data?.message
        || (err.code === "ERR_NETWORK" ? "Không thể kết nối đến server. Vui lòng kiểm tra backend đã khởi động chưa." : "Tên đăng nhập hoặc mật khẩu không đúng")
      return { success: false, message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout()
    } catch { /* ignore */ }
    setUser(null)
    setToken(null)
    localStorage.removeItem("smms-user")
    localStorage.removeItem("smms-token")
    localStorage.removeItem("smms-refresh-token")
  }, [token])

  const hasRole = useCallback((role) => {
    if (!user) return false
    return user.roles.includes(role)
  }, [user])

  const hasAnyRole = useCallback((...roles) => {
    if (!user) return false
    return roles.some((role) => user.roles.includes(role))
  }, [user])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, hasAnyRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
