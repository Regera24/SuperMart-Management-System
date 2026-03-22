import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, User, Lock, Moon, Sun, ShoppingCart, BarChart3, Package } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await login(username, password)
      if (result.success) {
        navigate("/dashboard")
      } else {
        setError(result.message)
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Floating icons */}
          <div className="absolute top-20 left-16 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "3s" }}>
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <div className="absolute top-40 right-20 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-bounce" style={{ animationDelay: "1s", animationDuration: "3.5s" }}>
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div className="absolute bottom-32 left-24 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-bounce" style={{ animationDelay: "1.5s", animationDuration: "4s" }}>
            <Package className="h-8 w-8 text-white" />
          </div>

          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white font-bold text-2xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">SMMS</h1>
              <p className="text-emerald-100 text-sm">SuperMart Management System</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-2">Hệ thống Quản lý Siêu thị</h2>
          <p className="text-emerald-100 text-center max-w-md">
            Giải pháp quản lý toàn diện cho siêu thị hiện đại — Bán hàng, Tồn kho, Nhân viên, Báo cáo
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-12">
            {[
              { label: "Sản phẩm", value: "1,200+" },
              { label: "Đơn hàng/ngày", value: "300+" },
              { label: "Nhân viên", value: "50+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-emerald-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background relative">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-6 right-6 p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold">SMMS</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Đăng nhập</h2>
          <p className="text-muted-foreground mb-8">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-input h-4 w-4 accent-primary"
                />
                Ghi nhớ đăng nhập
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25"
              size="lg"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          

          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 SMMS — SuperMart Management System
          </p>
        </div>
      </div>
    </div>
  )
}
