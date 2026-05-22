import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Users, Warehouse,
  UserCog, FileBarChart, Bell, Settings, ChevronLeft, ChevronRight,
  ClipboardList, UserCircle, LogOut, Clock, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const navItems = [
  { title: "Tổng quan", icon: LayoutDashboard, path: "/dashboard", roles: ["ADMIN", "MANAGER"] },
  { title: "POS Bán hàng", icon: ShoppingCart, path: "/pos", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Đơn hàng", icon: ClipboardList, path: "/orders", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Sản phẩm", icon: Package, path: "/products", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Danh mục", icon: FolderTree, path: "/categories", roles: ["ADMIN", "MANAGER"] },
  { title: "Khách hàng", icon: Users, path: "/customers", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Tồn kho", icon: Warehouse, path: "/inventory", roles: ["ADMIN", "MANAGER"] },
  { title: "Nhân viên", icon: UserCircle, path: "/staff", roles: ["ADMIN"] },
  { title: "Chấm công", icon: Clock, path: "/my-attendance", roles: ["ADMIN", "MANAGER", "CASHIER", "STAFF"] },
  { title: "Quản lý Users", icon: UserCog, path: "/users", roles: ["ADMIN"] },
  { title: "Báo cáo", icon: FileBarChart, path: "/reports", roles: ["ADMIN", "MANAGER"] },
  { title: "Thông báo", icon: Bell, path: "/notifications", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { title: "Trang Landing", icon: Globe, path: "/store-settings", roles: ["ADMIN"] },
  { title: "Cài đặt", icon: Settings, path: "/settings", roles: ["ADMIN", "MANAGER", "CASHIER"] },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, hasAnyRole } = useAuth()
  const location = useLocation()

  const filteredNav = navItems.filter((item) => hasAnyRole(...item.roles))

  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar-background text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-16 items-center gap-3 border-b border-sidebar-border px-4", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-sm">
            S
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-tight">SMMS</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")
            const link = (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-primary",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
                {!collapsed && <span>{item.title}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                )}
              </NavLink>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-sidebar-background text-sidebar-foreground border-sidebar-border">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User section */}
        <div className={cn("p-3", collapsed && "flex flex-col items-center")}>
          {!collapsed ? (
            <div className="flex items-center gap-3 rounded-lg p-2">
              <Avatar className="h-9 w-9 border-2 border-sidebar-primary/30">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.roles?.[0]}</p>
              </div>
              <button onClick={logout} className="rounded-md p-1.5 hover:bg-sidebar-accent transition-colors" title="Đăng xuất">
                <LogOut className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={logout} className="rounded-md p-2 hover:bg-sidebar-accent transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Đăng xuất</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </TooltipProvider>
  )
}
