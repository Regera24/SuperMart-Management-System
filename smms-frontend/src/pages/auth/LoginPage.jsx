import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import useStoreConfig from "@/hooks/useStoreConfig"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Moon,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  Sun,
  TrendingUp,
  User,
} from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForgotMessage, setShowForgotMessage] = useState(false)
  const { login } = useAuth()
  const { theme, setTheme } = useTheme()
  const { config } = useStoreConfig()
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

  const pulseCards = [
    { icon: ShoppingCart, label: "Đơn hôm nay", value: "300+", tone: "text-emerald-200" },
    { icon: Package, label: "Tồn kho ổn định", value: "96%", tone: "text-amber-200" },
    { icon: Activity, label: "Quầy đang mở", value: "08", tone: "text-cyan-200" },
  ]

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative hidden overflow-hidden bg-[#101820] text-white lg:block">
        <img
          src={config.loginImage}
          alt={`${config.name} checkout operations`}
          className="absolute inset-0 h-full w-full object-cover slow-pan"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(10,17,24,.92),rgba(10,17,24,.62)_52%,rgba(10,17,24,.3))]" />
        <div className="absolute inset-0 soft-grid opacity-35" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-white/20 bg-white/12 shadow-2xl backdrop-blur">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-tight">{config.name}</p>
              <p className="text-sm font-medium text-white/58">Retail Operations Suite</p>
            </div>
          </div>

          <div className="max-w-2xl motion-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-emerald-200/20 bg-emerald-300/12 px-4 py-2 text-sm font-bold text-emerald-100 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Quyền truy cập bảo mật cho vận hành cửa hàng
            </div>
            <h1 className="text-5xl font-extrabold leading-[0.98] tracking-tight xl:text-6xl">
              Điều phối bán hàng, tồn kho và đội ngũ trong một nhịp.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/68">
              SMMS giúp quản lý cửa hàng nhìn rõ doanh thu, đơn hàng, sản phẩm và nhân sự ngay khi bước vào ca làm.
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            {pulseCards.map((item, index) => (
              <div
                key={item.label}
                className="motion-rise rounded-md border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/20 backdrop-blur"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-white/10 ${item.tone}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-extrabold">{item.value}</p>
                <p className="text-sm text-white/56">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-md border border-border bg-card/80 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground sm:right-8 sm:top-8"
          aria-label="Đổi giao diện sáng tối"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="w-full max-w-[440px] motion-rise">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-primary-foreground shadow-lg">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold">{config.name}</p>
              <p className="text-xs font-medium text-muted-foreground">Retail Operations Suite</p>
            </div>
          </div>

          <div className="retail-card p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                Store cockpit access
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Đăng nhập</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Chào mừng trở lại. Vào hệ thống để tiếp tục điều phối hoạt động hôm nay.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 rounded-md pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-md pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <button
                  type="button"
                  className="text-sm font-bold text-primary hover:underline"
                  onClick={() => setShowForgotMessage(!showForgotMessage)}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {showForgotMessage && (
                <div className="rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-center text-sm font-medium text-amber-700 dark:text-amber-300">
                  Hãy liên hệ với quản lý của bạn để reset mật khẩu
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-md bg-slate-950 text-base font-extrabold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                size="lg"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-border pt-5">
              {[
                { icon: ShoppingCart, label: "POS" },
                { icon: BarChart3, label: "Báo cáo" },
                { icon: Package, label: "Kho" },
              ].map((item) => (
                <div key={item.label} className="rounded-md bg-muted/60 p-3 text-center">
                  <item.icon className="mx-auto mb-2 h-4 w-4 text-primary" />
                  <p className="text-xs font-extrabold text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
            © 2026 {config.name} · SuperMart Management System
          </p>
        </div>
      </section>
    </div>
  )
}
