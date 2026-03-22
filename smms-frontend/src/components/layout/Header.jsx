import { Bell, Moon, Sun, Search, Monitor } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useNavigate, useLocation } from "react-router-dom"

const breadcrumbMap = {
  "/dashboard": "Tổng quan", "/pos": "POS Bán hàng", "/orders": "Đơn hàng",
  "/products": "Sản phẩm", "/categories": "Danh mục", "/customers": "Khách hàng",
  "/inventory": "Tồn kho", "/staff": "Nhân viên", "/users": "Quản lý Users",
  "/reports": "Báo cáo", "/notifications": "Thông báo", "/settings": "Cài đặt",
}

const TYPE_COLORS = { ORDER: "bg-emerald-500", INVENTORY: "bg-amber-500", CUSTOMER: "bg-blue-500", SYSTEM: "bg-purple-500" }

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
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
  const getInitials = (name) => name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U"
  const cycleTheme = () => { if (theme === "light") setTheme("dark"); else if (theme === "dark") setTheme("system"); else setTheme("light") }
  const latestNotifs = notifications.slice(0, 4)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Tổng quan</span>
        {currentPath !== "/dashboard" && (<><span className="text-muted-foreground">/</span><span className="font-medium">{pageTitle}</span></>)}
      </div>
      <div className="flex-1" />
      <Button variant="outline" className="hidden md:flex gap-2 text-muted-foreground w-64 justify-start"><Search className="h-4 w-4" /><span className="text-sm">Tìm kiếm...</span><kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd></Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative"><Bell className="h-5 w-5" />{unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-pulse">{unreadCount > 9 ? "9+" : unreadCount}</span>}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between"><span>Thông báo {unreadCount > 0 && `(${unreadCount})`}</span>{unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Đánh dấu đã đọc</button>}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {latestNotifs.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <div className="flex items-center gap-2">{!n.read && <div className={`h-2 w-2 rounded-full ${TYPE_COLORS[n.type] || "bg-primary"} animate-pulse`} />}<span className={`text-sm ${!n.read ? "font-medium" : "text-muted-foreground"}`}>{n.title}</span></div>
              <p className="text-xs text-muted-foreground pl-4">{n.message} — {timeAgo(n.createdAt)}</p>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-primary cursor-pointer" onClick={() => navigate("/notifications")}>Xem tất cả thông báo</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" onClick={cycleTheme} title={`Theme: ${theme}`}>{theme === "light" ? <Sun className="h-5 w-5" /> : theme === "dark" ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}</Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(user?.fullName)}</AvatarFallback></Avatar>
            <div className="hidden md:flex flex-col items-start"><span className="text-sm font-medium">{user?.fullName}</span><span className="text-xs text-muted-foreground">{user?.roles?.[0]}</span></div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel><div className="flex flex-col"><span>{user?.fullName}</span><span className="text-xs font-normal text-muted-foreground">{user?.email}</span></div></DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/settings")}>Cài đặt tài khoản</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">Đăng xuất</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
