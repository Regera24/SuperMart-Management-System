import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import * as orderApi from "@/api/orderApi"
import { Loader2 } from "lucide-react"

const STATUS_LABELS = { COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy", PENDING: "Đang xử lý" }
const METHOD_LABELS = { CASH: "Tiền mặt", CREDIT_CARD: "Thẻ", BANK_TRANSFER: "Chuyển khoản", QR_CODE: "QR Code", WALLET: "Ví điện tử" }

export default function OrderDetailDialog({ open, onOpenChange, orderId }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !orderId) return
    setLoading(true)
    orderApi.getOrderById(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [open, orderId])

  const displayId = (o) => o?.orderCode || (o?.id ? String(o.id).substring(0, 8).toUpperCase() : "—")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Chi tiết đơn hàng #{order ? displayId(order) : ""}</DialogTitle></DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : order ? (
          <div className="space-y-5">
            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Mã đơn</span><span className="text-sm font-mono font-medium">{displayId(order)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Trạng thái</span><Badge variant={order.status === "COMPLETED" ? "success" : order.status === "CANCELLED" ? "destructive" : "secondary"}>{STATUS_LABELS[order.status] || order.status}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Thanh toán</span><span className="text-sm">{METHOD_LABELS[order.paymentMethod] || order.paymentMethod || "—"}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Tạo lúc</span><span className="text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Cashier</span><span className="text-sm">{order.cashierId ? String(order.cashierId).substring(0, 8) : "—"}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Khách hàng</span><span className="text-sm">{order.customerId || "Khách vãng lai"}</span></div>
              </div>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Sản phẩm ({order.items.length})</h4>
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Sản phẩm</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr></thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{item.productName || item.productSku}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Tổng đơn hàng</span><span className="text-sm">{formatCurrency(order.totalAmount)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Giảm giá</span><span className="text-sm text-emerald-500">-{formatCurrency(order.discountAmount)}</span></div>}
              <div className="flex justify-between font-bold"><span>Thành tiền</span><span className="text-lg">{formatCurrency(order.finalAmount ?? order.totalAmount)}</span></div>
            </div>

            {/* Payments */}
            {order.payments?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Thanh toán</h4>
                {order.payments.map((p, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span>{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</span>
                    <span className="font-medium">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Không tìm thấy đơn hàng</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
