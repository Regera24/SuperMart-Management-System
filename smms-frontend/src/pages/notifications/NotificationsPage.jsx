import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/contexts/NotificationContext"
import { Bell, ShoppingCart, Package, Users, Settings, Check, CheckCheck } from "lucide-react"
import { useState } from "react"

const TYPE_ICONS = { ORDER: ShoppingCart, INVENTORY: Package, CUSTOMER: Users, SYSTEM: Settings }
const TYPE_COLORS = { ORDER: "text-emerald-500 bg-emerald-500/10", INVENTORY: "text-amber-500 bg-amber-500/10", CUSTOMER: "text-blue-500 bg-blue-500/10", SYSTEM: "text-purple-500 bg-purple-500/10" }
const TYPE_LABELS = { ORDER: "Đơn hàng", INVENTORY: "Tồn kho", CUSTOMER: "Khách hàng", SYSTEM: "Hệ thống" }

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Vừa xong"
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState("all")

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read
    if (filter === "read") return n.read
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Thông báo</h1><p className="text-sm text-muted-foreground">{unreadCount} chưa đọc</p></div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllAsRead}><CheckCheck className="h-4 w-4 mr-1" /> Đánh dấu tất cả đã đọc</Button>}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Tất cả <Badge variant="secondary" className="ml-1">{notifications.length}</Badge></TabsTrigger>
          <TabsTrigger value="unread">Chưa đọc <Badge variant="destructive" className="ml-1">{unreadCount}</Badge></TabsTrigger>
          <TabsTrigger value="read">Đã đọc</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((n) => {
          const Icon = TYPE_ICONS[n.type] || Bell
          return (
            <Card key={n.id} className={`transition-all hover:shadow-md cursor-pointer ${!n.read ? "border-l-4 border-l-primary bg-primary/[0.02]" : ""}`} onClick={() => markAsRead(n.id)}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`rounded-xl p-2.5 ${TYPE_COLORS[n.type] || "text-gray-500 bg-gray-500/10"}`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}>{n.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{TYPE_LABELS[n.type] || n.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse mt-1.5" />}
                {n.read && <Check className="h-4 w-4 text-muted-foreground mt-1.5" />}
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground"><Bell className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Không có thông báo nào</p></div>}
      </div>
    </div>
  )
}
