import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import * as customerApi from "@/api/customerApi"
import { Loader2 } from "lucide-react"

const TIER_LABELS = { REGULAR: "Thường", BRONZE: "Đồng", SILVER: "Bạc", GOLD: "Vàng", PLATINUM: "Bạch kim", DIAMOND: "Kim cương" }
const TIER_COLORS = { REGULAR: "bg-gray-500", BRONZE: "bg-amber-700", SILVER: "bg-gray-400", GOLD: "bg-yellow-500", PLATINUM: "bg-emerald-600", DIAMOND: "bg-purple-600" }

export default function CustomerDetailDialog({ open, onOpenChange, customerId }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !customerId) return
    setLoading(true)
    customerApi.getCustomerById(customerId)
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false))
  }, [open, customerId])

  const tier = customer?.tier || customer?.loyaltyTier || "REGULAR"
  const points = customer?.currentPoints ?? customer?.loyaltyPoints ?? 0

  const rows = customer ? [
    { label: "Họ tên", value: customer.fullName },
    { label: "Số điện thoại", value: customer.phone },
    { label: "Email", value: customer.email || "—" },
    { label: "Địa chỉ", value: customer.address || "—" },
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
          <div className="divide-y">
            {rows.map(r => (
              <div key={r.label} className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Không tìm thấy khách hàng</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
