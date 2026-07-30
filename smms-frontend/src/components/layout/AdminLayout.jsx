import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { cn } from "@/lib/utils"

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-shell min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-[68px]" : "ml-[260px]")}>
        <Header />
        <main className="relative p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
