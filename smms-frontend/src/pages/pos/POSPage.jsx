import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { buildInvoiceHTML, printInvoiceHTML } from "@/lib/printInvoice"
import * as productApi from "@/api/productApi"
import * as orderApi from "@/api/orderApi"
import * as customerApi from "@/api/customerApi"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, ArrowLeft, User, Loader2, Printer, ScanLine } from "lucide-react"
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
  const getProductInitial = (product) => (product?.name || product?.sku || "P").trim().slice(0, 1).toUpperCase()

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
    <div className="app-shell flex h-screen overflow-hidden">
      {/* Left: Product Grid */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-background/80 p-4 backdrop-blur-xl">
          <Button variant="ghost" size="icon" className="rounded-md" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-extrabold">POS bán hàng</h1>
            <p className="text-xs font-medium text-muted-foreground">Chạm sản phẩm để thêm vào giỏ</p>
          </div>
          <div className="flex-1" />
          <div className="relative w-80 max-w-[42vw]">
            <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              ref={searchRef}
              placeholder="Quét SKU hoặc tìm sản phẩm..."
              className="h-10 rounded-md border-border bg-card/80 pl-10 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="retail-scrollbar flex-1 overflow-auto p-4">
          {loadingProducts ? (
            <div className="grid h-full place-items-center">
              <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Đang tải kệ hàng...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  className="retail-card group overflow-hidden text-left transition hover:-translate-y-1 hover:border-primary/40 active:scale-[0.98]"
                  onClick={() => addToCart(p)}
                >
                  <div className="image-sheen relative aspect-square overflow-hidden bg-muted">
                    {p.imageUrls?.length > 0 && (
                      <img
                        src={p.imageUrls[0]}
                        alt={p.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    )}
                    <div className={`${p.imageUrls?.length > 0 ? "hidden" : ""} flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f6ead7,#dff5e8_55%,#dcecff)]`}>
                      <span className="grid h-16 w-16 place-items-center rounded-md bg-white/70 text-2xl font-extrabold text-emerald-800 shadow-lg">
                        {getProductInitial(p)}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded-sm bg-black/55 px-2 py-1 text-[11px] font-extrabold text-white backdrop-blur">
                      {p.unit || "SP"}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-extrabold">{p.name}</p>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <span className="truncate font-mono text-[11px] font-bold text-muted-foreground">{p.sku}</span>
                      <span className="shrink-0 text-sm font-extrabold text-primary">{formatCurrency(p.price)}</span>
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full grid min-h-[280px] place-items-center rounded-md border border-dashed border-border bg-card/60 text-sm font-bold text-muted-foreground">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <aside className="flex w-[400px] shrink-0 flex-col border-l border-border bg-card/92 shadow-2xl shadow-black/10 backdrop-blur">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-extrabold">Giỏ hàng</h2>
                <p className="text-xs font-medium text-muted-foreground">{cart.length} sản phẩm đang chọn</p>
              </div>
            </div>
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-extrabold text-muted-foreground">Live</span>
          </div>
        </div>
        <div className="retail-scrollbar flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-md bg-muted">
                <ShoppingCart className="h-8 w-8 opacity-35" />
              </div>
              <p className="text-sm font-bold">Chọn sản phẩm để thêm vào giỏ</p>
              <p className="mt-1 text-xs">Dùng ô tìm kiếm hoặc chạm trực tiếp trên kệ hàng.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-[44px_1fr] gap-3 p-3">
                  <div className="overflow-hidden rounded-md bg-muted">
                    {item.imageUrls?.length > 0 ? (
                      <img src={item.imageUrls[0]} alt={item.name} className="h-11 w-11 object-cover" />
                    ) : (
                      <div className="grid h-11 w-11 place-items-center bg-emerald-500/10 text-sm font-extrabold text-emerald-700">
                        {getProductInitial(item)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">{item.name}</p>
                        <p className="text-xs font-medium text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-md text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQty(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-extrabold">{item.qty}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQty(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-extrabold">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer lookup */}
        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <Input
              placeholder="SĐT khách hàng..."
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookupCustomer()}
              className="h-10 rounded-md text-sm"
            />
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-md" onClick={handleLookupCustomer}>
              <User className="h-4 w-4" />
            </Button>
          </div>
          {customer && (
            <div className="mt-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {customer.fullName} · {customer.tier || "REGULAR"} · {(customer.currentPoints || 0).toLocaleString()} điểm
              </p>
              {discountPercent > 0 && (
                <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  Giảm hạng {tierDiscount?.tierLevel}: {discountPercent}%{maxDiscountAmt > 0 ? ` (tối đa ${formatCurrency(maxDiscountAmt)})` : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Totals + Checkout */}
        <div className="space-y-3 border-t border-border p-4">
          <div className="space-y-2 rounded-md bg-muted/50 p-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tạm tính</span><span className="font-bold">{formatCurrency(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="font-bold text-emerald-600 dark:text-emerald-300">Giảm giá ({discountPercent}% · {tierDiscount?.tierLevel || "KH"})</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-300">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-lg font-extrabold">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
          <Button className="h-12 w-full rounded-md bg-slate-950 text-base font-extrabold text-white hover:bg-primary dark:bg-primary dark:text-primary-foreground" disabled={cart.length === 0} onClick={() => setShowPayment(true)}>
            Thanh toán
          </Button>
        </div>
      </aside>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md rounded-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Chọn phương thức thanh toán
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-3">
            <div className="rounded-md border border-border bg-muted/45 p-5 text-center">
              <p className="text-sm font-bold text-muted-foreground">{cart.length} sản phẩm</p>
              <p className="mt-1 text-3xl font-extrabold text-primary">{formatCurrency(total)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { v: "CASH", icon: Banknote, label: "Tiền mặt" },
                { v: "CREDIT_CARD", icon: CreditCard, label: "Thẻ" },
                { v: "BANK_TRANSFER", icon: CreditCard, label: "Chuyển khoản" },
                { v: "QR_CODE", icon: Smartphone, label: "QR Code" },
                { v: "WALLET", icon: Smartphone, label: "Ví điện tử" },
              ].map((m) => (
                <button
                  key={m.v}
                  onClick={() => setPaymentMethod(m.v)}
                  className={`flex min-h-[94px] flex-col items-center justify-center gap-2 rounded-md border p-3 transition-all ${
                    paymentMethod === m.v
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-input bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <m.icon className="h-6 w-6" />
                  <span className="text-center text-xs font-extrabold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-md" onClick={() => setShowPayment(false)} disabled={processing}>Hủy</Button>
            <Button onClick={handleCheckout} disabled={processing} className="gap-2 rounded-md bg-slate-950 text-white hover:bg-primary dark:bg-primary dark:text-primary-foreground">
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
          <div className="flex-1 overflow-auto border rounded-md bg-white min-h-[400px]">
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
