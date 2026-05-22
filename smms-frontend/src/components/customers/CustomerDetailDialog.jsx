import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import * as customerApi from "@/api/customerApi"
import { Loader2, Star, ArrowUp, ArrowDown } from "lucide-react"

const TIER_LABELS = { REGULAR: "Thường", BRONZE: "Đồng", SILVER: "Bạc", GOLD: "Vàng", PLATINUM: "Bạch kim", DIAMOND: "Kim cương" }
const TIER_COLORS = { REGULAR: "bg-gray-500", BRONZE: "bg-amber-700", SILVER: "bg-gray-400", GOLD: "bg-yellow-500", PLATINUM: "bg-emerald-600", DIAMOND: "bg-purple-600" }

export default function CustomerDetailDialog({ open, onOpenChange, customerId }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pointHistory, setPointHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    if (!open || !customerId) return
    setLoading(true)
    setActiveTab("info")
    customerApi.getCustomerById(customerId)
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false))
  }, [open, customerId])

  useEffect(() => {
    if (!open || !customerId || activeTab !== "points") return
    setLoadingHistory(true)
    customerApi.getPointHistory(customerId, { page: 0, size: 50 })
      .then(res => setPointHistory(res.content || []))
      .catch(() => setPointHistory([]))
      .finally(() => setLoadingHistory(false))
  }, [open, customerId, activeTab])

  const tier = customer?.tier || customer?.loyaltyTier || "REGULAR"
  const points = customer?.currentPoints ?? customer?.loyaltyPoints ?? 0

  const infoRows = customer ? [
    { label: "Họ tên", value: customer.fullName },
    { label: "Số điện thoại", value: customer.phone },
    { label: "Ngày sinh", value: customer.dob || "—" },
    { label: "Hạng thẻ", value: <Badge className={`${TIER_COLORS[tier]} text-white`}>{TIER_LABELS[tier] || tier}</Badge> },
    { label: "Điểm tích lũy", value: <span className="font-bold text-amber-500">{points.toLocaleString()}</span> },
    { label: "Tổng chi tiêu", value: <span className="font-bold">{formatCurrency(customer.totalSpent)}</span> },
    { label: "Ngày tạo", value: customer.createdAt ? new Date(customer.createdAt).toLocaleString("vi-VN") : "—" },
  ] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Chi tiết khách hàng</DialogTitle></DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : customer ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Thông tin</TabsTrigger>
              <TabsTrigger value="points" className="flex-1"><Star className="h-3.5 w-3.5 mr-1" /> Lịch sử điểm</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <div className="divide-y">
                {infoRows.map(r => (
                  <div key={r.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className="text-sm font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="points" className="mt-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : pointHistory.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {pointHistory.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-1.5 ${t.type === "EARN" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                          {t.type === "EARN" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.type === "EARN" ? "Tích điểm" : "Đổi điểm"}</p>
                          <p className="text-xs text-muted-foreground">{t.description || t.orderId || "—"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.pointsAmount >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {t.pointsAmount >= 0 ? "+" : ""}{t.pointsAmount}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.transactionDate ? new Date(t.transactionDate).toLocaleString("vi-VN") : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">Chưa có lịch sử điểm</p>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-10">Không tìm thấy khách hàng</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
