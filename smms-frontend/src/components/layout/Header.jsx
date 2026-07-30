import { useLocation, useNavigate } from "react-router-dom"
import { Bell, CheckCircle2, ChevronDown, Command, Monitor, Moon, Search, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const breadcrumbMap = {
  "/dashboard": "Tổng quan",
  "/pos": "POS bán hàng",
  "/orders": "Đơn hàng",
  "/products": "Sản phẩm",
  "/categories": "Danh mục",
  "/customers": "Khách hàng",
  "/inventory": "Tồn kho",
  "/staff": "Nhân viên",
  "/my-attendance": "Chấm công",
  "/users": "Quản lý users",
  "/reports": "Báo cáo",
  "/notifications": "Thông báo",
  "/settings": "Cài đặt",
  "/store-settings": "Trang cửa hàng",
}

const TYPE_COLORS = {
  ORDER: "bg-emerald-500",
  INVENTORY: "bg-amber-500",
  CUSTOMER: "bg-blue-500",
  SYSTEM: "bg-purple-500",
}

function timeAgo(dateStr) {
  const date = new Date(dateStr).getTime()
  if (Number.isNaN(date)) return "vừa xong"
  const diff = Date.now() - date
  const mins = Math.max(0, Math.floor(diff / 60000))
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

export default function Header() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = "/" + location.pathname.split("/")[1]
  const pageTitle = breadcrumbMap[currentPath] || "Tổng quan"
  const latestNotifs = notifications.slice(0, 4)

  const getInitials = (name) =>
    name ? name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "U"

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/78 px-5 backdrop-blur-xl lg:px-6">
      <div className="flex h-16 items-center gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            <span>SMMS</span>
            <span>/</span>
            <span>Operations</span>
          </div>
          <h1 className="truncate text-lg font-extrabold tracking-tight">{pageTitle}</h1>
        </div>

        <div className="flex-1" />

        <button className="hidden h-10 w-[280px] items-center gap-3 rounded-md border border-border bg-card/70 px-3 text-left text-sm text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-foreground md:flex">
          <Search className="h-4 w-4" />
          <span className="flex-1">Tìm nhanh đơn hàng, sản phẩm...</span>
          <span className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold">
            <Command className="h-3 w-3" /> K
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-md">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-extrabold text-white shadow-lg">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[344px] max-w-[calc(100vw-2rem)]">
            <DropdownMenuLabel className="flex items-center justify-between gap-3">
              <span>Thông báo {unreadCount > 0 && `(${unreadCount})`}</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã đọc
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {latestNotifs.length > 0 ? (
              latestNotifs.map((item) => (
                <DropdownMenuItem key={item.id} className="flex cursor-pointer flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${TYPE_COLORS[item.type] || "bg-primary"}`} />
                    <span className={`min-w-0 flex-1 truncate text-sm ${!item.read ? "font-extrabold" : "text-muted-foreground"}`}>
                      {item.title}
                    </span>
                  </div>
                  <p className="line-clamp-2 pl-4 text-xs leading-5 text-muted-foreground">
                    {item.message} · {timeAgo(item.createdAt)}
                  </p>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-5 text-center text-sm text-muted-foreground">Chưa có thông báo</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center font-bold text-primary" onClick={() => navigate("/notifications")}>
              Xem tất cả thông báo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={cycleTheme} title={`Theme: ${theme}`} className="rounded-md">
          {theme === "light" ? <Sun className="h-5 w-5" /> : theme === "dark" ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 rounded-md px-2">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-xs font-extrabold text-primary">{getInitials(user?.fullName)}</AvatarFallback>
              </Avatar>
              <div className="hidden min-w-0 flex-col items-start md:flex">
                <span className="max-w-[150px] truncate text-sm font-extrabold">{user?.fullName || "Người dùng"}</span>
                <span className="text-xs font-medium text-muted-foreground">{user?.roles?.[0] || "STAFF"}</span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.fullName || "Người dùng"}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>Cài đặt tài khoản</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
