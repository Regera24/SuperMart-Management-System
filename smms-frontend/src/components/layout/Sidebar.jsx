import { NavLink, useLocation } from "react-router-dom"
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileBarChart,
  FolderTree,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Store,
  UserCircle,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { title: "Tổng quan", icon: LayoutDashboard, path: "/dashboard", roles: ["ADMIN", "MANAGER"] },
  { title: "POS bán hàng", icon: ShoppingCart, path: "/pos", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Đơn hàng", icon: ClipboardList, path: "/orders", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Sản phẩm", icon: Package, path: "/products", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Danh mục", icon: FolderTree, path: "/categories", roles: ["ADMIN", "MANAGER"] },
  { title: "Khách hàng", icon: Users, path: "/customers", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Tồn kho", icon: Warehouse, path: "/inventory", roles: ["ADMIN", "MANAGER"] },
  { title: "Nhân viên", icon: UserCircle, path: "/staff", roles: ["ADMIN"] },
  { title: "Chấm công", icon: Clock, path: "/my-attendance", roles: ["ADMIN", "MANAGER", "CASHIER", "STAFF"] },
  { title: "Quản lý users", icon: UserCog, path: "/users", roles: ["ADMIN"] },
  { title: "Báo cáo", icon: FileBarChart, path: "/reports", roles: ["ADMIN", "MANAGER"] },
  { title: "Thông báo", icon: Bell, path: "/notifications", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Trang cửa hàng", icon: Globe, path: "/store-settings", roles: ["ADMIN"] },
  { title: "Cài đặt", icon: Settings, path: "/settings", roles: ["ADMIN", "MANAGER", "CASHIER"] },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, hasAnyRole } = useAuth()
  const location = useLocation()
  const filteredNav = navItems.filter((item) => hasAnyRole(...item.roles))

  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground shadow-2xl shadow-black/20 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        <div className={cn("relative overflow-hidden border-b border-sidebar-border px-3 py-4", collapsed && "px-2")}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(52,211,153,.2),transparent_12rem)]" />
          <div className={cn("relative flex items-center gap-3", collapsed && "justify-center")}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-emerald-400 text-[#092016] shadow-lg shadow-emerald-950/20">
              <Store className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold tracking-tight">SMMS</p>
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/42">
                  Retail cockpit
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="retail-scrollbar flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")
            const link = (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold text-sidebar-foreground/70 transition-all hover:bg-white/[0.06] hover:text-white",
                  isActive && "bg-white/[0.08] text-white shadow-sm",
                  collapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.7)]" />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0 transition", isActive ? "text-emerald-200" : "text-sidebar-foreground/46 group-hover:text-white")} />
                {!collapsed && <span className="truncate">{item.title}</span>}
                {isActive && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300" />}
              </NavLink>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="border-sidebar-border bg-sidebar-background text-sidebar-foreground">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        <div className={cn("p-3", collapsed && "flex flex-col items-center")}>
          {!collapsed ? (
            <div className="rounded-md border border-white/8 bg-white/[0.04] p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-emerald-300/30">
                  <AvatarFallback className="bg-emerald-300/12 text-xs font-extrabold text-emerald-100">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">{user?.fullName || "Người dùng"}</p>
                  <p className="truncate text-xs font-medium text-sidebar-foreground/48">{user?.roles?.[0] || "STAFF"}</p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-md p-2 text-sidebar-foreground/46 transition hover:bg-white/8 hover:text-white"
                  title="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={logout} className="rounded-md p-2 text-sidebar-foreground/64 transition hover:bg-white/8 hover:text-white">
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Đăng xuất</TooltipContent>
            </Tooltip>
          )}
        </div>

        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-foreground shadow-lg transition hover:bg-accent"
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </TooltipProvider>
  )
}
