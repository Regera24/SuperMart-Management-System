import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { buildInvoiceHTML, printInvoiceHTML } from "@/lib/printInvoice"
import * as productApi from "@/api/productApi"
import * as orderApi from "@/api/orderApi"
import * as customerApi from "@/api/customerApi"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, X, ArrowLeft, User, Loader2, Printer } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"



export default function POSPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customer, setCustomer] = useState(null)
  const [tierDiscount, setTierDiscount] = useState(null) // { discountPercent, maxDiscountAmount, tierLevel }
  const [processing, setProcessing] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [invoiceHTML, setInvoiceHTML] = useState(null)
  const searchRef = useRef(null)
  const invoiceIframeRef = useRef(null)

  useEffect(() => {
    async function fetch() {
      setLoadingProducts(true)
      try {
        const result = await productApi.getProducts({ page: 0, size: 100, isActive: true })
        setProducts(result.content || [])
        if (!result.content?.length) toast.info("Không có sản phẩm nào")
      } catch {
        setProducts([])
        toast.error("Không thể tải danh sách sản phẩm")
      } finally { setLoadingProducts(false) }
    }
    fetch()
  }, [])

  const filtered = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const discountPercent = tierDiscount?.discountPercent ? parseFloat(tierDiscount.discountPercent) : 0
  const maxDiscountAmt = tierDiscount?.maxDiscountAmount ? parseFloat(tierDiscount.maxDiscountAmount) : 0
  const rawDiscount = customer && discountPercent > 0 ? Math.floor(subtotal * discountPercent / 100) : 0
  const discount = maxDiscountAmt > 0 ? Math.min(rawDiscount, maxDiscountAmt) : rawDiscount
  const total = subtotal - discount

  const handleLookupCustomer = async () => {
    if (!customerPhone) return
    try {
      const c = await customerApi.getCustomerByPhone(customerPhone)
      setCustomer(c)
      // Fetch tier discount config for this customer's rank
      try {
        const td = await customerApi.getTierDiscount(c.tier || "REGULAR")
        setTierDiscount(td)
      } catch { setTierDiscount(null) }
      toast.success(`Khách hàng: ${c.fullName || c.phone} — ${c.tier || "REGULAR"}`)
    } catch { setCustomer(null); setTierDiscount(null); toast.error("Không tìm thấy KH") }
  }

  const [processingMessage, setProcessingMessage] = useState("")

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setProcessing(true)
    setProcessingMessage("Đang tạo đơn hàng...")
    try {
      const data = {
        warehouseId: 1,
        items: cart.map(i => ({
          productSku: i.sku,
          productName: i.name,
          quantity: i.qty,
          unitPrice: i.price,
        })),
        paymentMethod,
        customerId: customer?.id || null,
        discountAmount: discount > 0 ? discount : null,
        paidAmount: null,
        note: null,
      }
      const order = await orderApi.checkout(data)

      // Poll for saga completion
      setProcessingMessage("Đang kiểm tra tồn kho...")
      const finalOrder = await orderApi.pollOrderStatus(order.id)

      if (finalOrder?.status === "COMPLETED") {
        // ✅ Success
        toast.success("Thanh toán thành công!", {
          description: `Mã đơn: ${finalOrder.orderCode || "—"} • Tổng: ${formatCurrency(finalOrder.finalAmount ?? total)}`,
        })
        addNotification({ type: "ORDER", title: "Đơn hàng mới", message: `Tổng: ${formatCurrency(finalOrder.finalAmount ?? total)} — Thu ngân: ${user?.fullName}` })
        // Award loyalty points
        if (customer?.id && finalOrder?.finalAmount) {
          try {
            const pointsEarned = await customerApi.earnFromOrder(customer.id, finalOrder.finalAmount, finalOrder.orderCode || "")
            if (pointsEarned > 0) {
              toast.info(`+${pointsEarned} điểm tích lũy cho ${customer.fullName || "KH"}`)
            }
          } catch (e) { console.warn("Earn points failed:", e) }
        }
        // Show invoice
        const html = buildInvoiceHTML(finalOrder, cart, customer, user)
        setInvoiceHTML(html)
        setCart([])
        setCustomer(null)
        setTierDiscount(null)
        setCustomerPhone("")
        setShowPayment(false)
      } else if (finalOrder?.status === "STOCK_RESERVE_FAILED") {
        // ❌ Out of stock — keep cart so user can adjust
        toast.error("Không đủ hàng tồn kho!", {
          description: "Một số sản phẩm đã hết hàng. Vui lòng giảm số lượng hoặc xóa sản phẩm hết hàng.",
          duration: 6000,
        })
        setShowPayment(false)
      } else if (finalOrder?.status === "PENDING" || finalOrder?.status === "STOCK_RESERVING") {
        // ⏳ Timeout — saga still processing
        toast.warning("Đơn hàng đang được xử lý", {
          description: `Mã đơn: ${finalOrder?.orderCode || order.orderCode || "—"}. Vui lòng kiểm tra lại trong mục Đơn hàng.`,
          duration: 8000,
        })
        setShowPayment(false)
      } else {
        // Unknown / other status
        toast.warning("Đơn hàng đã tạo", {
          description: `Trạng thái: ${finalOrder?.status || "Không xác định"}. Kiểm tra trong mục Đơn hàng.`,
        })
        setShowPayment(false)
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại."
      toast.error(msg, { duration: 6000 })
    } finally {
      setProcessing(false)
      setProcessingMessage("")
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-lg font-bold">POS Bán hàng</h1>
          <div className="flex-1" />
          <div className="relative w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input ref={searchRef} placeholder="Tìm sản phẩm (SKU / tên)..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loadingProducts ? <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(p => (
                <Card key={p.id} className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => addToCart(p)}>
                  <CardContent className="p-3">
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-3xl mb-2 overflow-hidden">
                      {p.imageUrls?.length > 0 ? (
                        <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📦' }} />
                      ) : '📦'}
                    </div>
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground font-mono">{p.sku}</span>
                      <span className="text-sm font-bold text-primary">{formatCurrency(p.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-[380px] border-l flex flex-col bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /><h2 className="font-bold">Giỏ hàng ({cart.length})</h2></div>
        </div>
        <div className="flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><ShoppingCart className="h-12 w-12 mb-3 opacity-20" /><p className="text-sm">Chọn sản phẩm để thêm</p></div>
          ) : (
            <div className="divide-y">{cart.map(item => (
              <div key={item.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p></div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <span className="text-sm font-bold w-24 text-right">{formatCurrency(item.price * item.qty)}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}</div>
          )}
        </div>

        {/* Customer lookup */}
        <div className="p-3 border-t">
          <div className="flex gap-1"><Input placeholder="SĐT khách hàng..." value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookupCustomer()} className="text-sm" /><Button variant="outline" size="icon" onClick={handleLookupCustomer}><User className="h-4 w-4" /></Button></div>
          {customer && (
            <div className="mt-1 space-y-0.5">
              <p className="text-xs text-emerald-500">✓ {customer.fullName} — {customer.tier || "REGULAR"} ({(customer.currentPoints || 0).toLocaleString()} điểm)</p>
              {discountPercent > 0 && <p className="text-xs text-amber-500">🎁 Giảm giá hạng {tierDiscount?.tierLevel}: {discountPercent}%{maxDiscountAmt > 0 ? ` (tối đa ${formatCurrency(maxDiscountAmt)})` : ""}</p>}
            </div>
          )}
        </div>

        {/* Totals + Checkout */}
        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-500">Giảm giá ({discountPercent}% — {tierDiscount?.tierLevel || "KH"})</span><span className="text-emerald-500">-{formatCurrency(discount)}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Tổng cộng</span><span className="text-primary">{formatCurrency(total)}</span></div>
          <Button className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-500 text-white" disabled={cart.length === 0} onClick={() => setShowPayment(true)}>Thanh toán</Button>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Chọn phương thức thanh toán</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center"><p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p><p className="text-sm text-muted-foreground">{cart.length} sản phẩm</p></div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "CASH", icon: Banknote, label: "Tiền mặt" },
                { v: "CREDIT_CARD", icon: CreditCard, label: "Thẻ" },
                { v: "BANK_TRANSFER", icon: CreditCard, label: "Chuyển khoản" },
                { v: "QR_CODE", icon: Smartphone, label: "QR Code" },
                { v: "WALLET", icon: Smartphone, label: "Ví điện tử" },
              ].map(m => (
                <button key={m.v} onClick={() => setPaymentMethod(m.v)} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${paymentMethod === m.v ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"}`}>
                  <m.icon className={`h-6 w-6 ${paymentMethod === m.v ? "text-primary" : "text-muted-foreground"}`} /><span className="text-xs font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)} disabled={processing}>Hủy</Button>
            <Button onClick={handleCheckout} disabled={processing} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white gap-2">
              {processing && <Loader2 className="h-4 w-4 animate-spin" />}
              {processing ? (processingMessage || "Đang xử lý...") : "Xác nhận thanh toán"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!invoiceHTML} onOpenChange={(open) => { if (!open) setInvoiceHTML(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-primary" />Xem trước hóa đơn</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg bg-white min-h-[400px]">
            <iframe
              ref={invoiceIframeRef}
              srcDoc={invoiceHTML || ""}
              title="Invoice Preview"
              className="w-full h-full min-h-[400px] border-0"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInvoiceHTML(null)}>Đóng</Button>
            <Button
              onClick={() => { if (invoiceHTML) printInvoiceHTML(invoiceHTML) }}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white gap-2"
            >
              <Printer className="h-4 w-4" /> In hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
