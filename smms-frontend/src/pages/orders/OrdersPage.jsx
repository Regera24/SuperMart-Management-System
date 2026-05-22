import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as orderApi from "@/api/orderApi"
import * as customerApi from "@/api/customerApi"
import { Search, Eye, Download, FileText, Loader2, User, X } from "lucide-react"
import { toast } from "sonner"
import Pagination from "@/components/ui/pagination"
import OrderDetailDialog from "@/components/orders/OrderDetailDialog"

const ORDER_COLUMNS = [
  { key: "_displayId", label: "Mã đơn" },
  { key: "createdAt", label: "Thời gian", format: (v) => v ? new Date(v).toLocaleString("vi-VN") : "" },
  { key: "paymentMethod", label: "Thanh toán" },
  { key: "_amount", label: "Tổng tiền", format: (v) => new Intl.NumberFormat("vi-VN").format(Number(v) || 0) + " ₫" },
  { key: "status", label: "Trạng thái", format: (v) => STATUS_LABELS[v] || v },
]

const STATUS_LABELS = {
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  PENDING: "Đang xử lý",
  STOCK_RESERVING: "Đang giữ hàng",
  STOCK_RESERVED: "Đã giữ hàng",
  STOCK_RESERVE_FAILED: "Hết hàng",
  CANCELLING: "Đang hủy",
  RETURNED: "Đã trả hàng",
}
const STATUS_VARIANT = {
  COMPLETED: "success",
  CANCELLED: "destructive",
  PENDING: "warning",
  STOCK_RESERVING: "warning",
  STOCK_RESERVED: "info",
  STOCK_RESERVE_FAILED: "destructive",
  CANCELLING: "warning",
  RETURNED: "secondary",
}


const METHOD_LABELS = { CASH: "Tiền mặt", CREDIT_CARD: "Thẻ", BANK_TRANSFER: "Chuyển khoản", QR_CODE: "QR Code", WALLET: "Ví điện tử" }
const METHOD_BADGE = { CASH: "success", CREDIT_CARD: "info", BANK_TRANSFER: "info", QR_CODE: "purple", WALLET: "purple" }

// Get display-friendly order ID: prefer orderCode, fallback to short UUID, or raw id
function displayOrderId(o) {
  if (o.orderCode) return o.orderCode
  const id = String(o.id || "")
  // If it's a UUID, show shortened version
  if (id.length > 20) return id.substring(0, 8).toUpperCase()
  return id
}

// Get amount from order response
function getAmount(o) {
  return o.finalAmount ?? o.totalAmount ?? 0
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")
  const [customerIdFilter, setCustomerIdFilter] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [customerResults, setCustomerResults] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [detailId, setDetailId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      let result
      if (customerIdFilter.trim()) {
        result = await orderApi.getOrdersByCustomer(customerIdFilter.trim(), { page, size: pageSize })
      } else {
        const params = { page, size: pageSize }
        if (tab !== "all") params.status = tab.toUpperCase()
        if (dateFrom) params.from = new Date(dateFrom).toISOString()
        if (dateTo) params.to = new Date(dateTo).toISOString()
        result = await orderApi.getOrders(params)
      }
      setOrders(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setOrders([])
      setTotalElements(0)
      toast.error("Không thể tải danh sách đơn hàng")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, tab, dateFrom, dateTo, customerIdFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = orders.filter(o => {
    if (!search) return true
    const id = displayOrderId(o).toLowerCase()
    return id.includes(search.toLowerCase())
  })

  // Enrich for export
  const enriched = filtered.map(o => ({ ...o, _displayId: displayOrderId(o), _amount: getAmount(o) }))

  const handleExportExcel = () => {
    exportToExcel(enriched, ORDER_COLUMNS, "don_hang", "Đơn hàng")
    toast.success("Xuất Excel thành công!", { description: `${filtered.length} đơn hàng` })
  }
  const handleExportPdf = () => {
    exportToPdf(enriched, ORDER_COLUMNS, "don_hang", {
      title: "Danh sách Đơn hàng",
      subtitle: `Tổng: ${filtered.length} đơn • ${new Intl.NumberFormat("vi-VN").format(filtered.reduce((s, o) => s + getAmount(o), 0))} ₫`,
    })
    toast.success("Xuất PDF thành công!")
  }

  const handleCancel = async (id) => {
    if (!confirm("Xác nhận hủy đơn hàng?")) return
    try {
      await orderApi.cancelOrder(id)
      toast.success("Đã hủy đơn hàng")
      fetchOrders()
    } catch { toast.error("Không thể hủy đơn hàng") }
  }

  const clearCustomerFilter = () => { setCustomerIdFilter(""); setSelectedCustomer(null); setCustomerSearch(""); setCustomerResults([]); setPage(0) }

  const handleCustomerSearch = async () => {
    if (!customerSearch.trim()) return
    try {
      // Try phone search first
      try {
        const byPhone = await customerApi.getCustomerByPhone(customerSearch.trim())
        if (byPhone) { setCustomerResults([byPhone]); setShowCustomerDropdown(true); return }
      } catch { /* not found by phone, try name */ }
      // Search by name
      const result = await customerApi.getCustomers({ page: 0, size: 10, search: customerSearch.trim() })
      setCustomerResults(result.content || [])
      setShowCustomerDropdown(true)
    } catch { toast.error("Không tìm thấy khách hàng") }
  }

  const selectCustomer = (c) => {
    setSelectedCustomer(c)
    setCustomerIdFilter(c.id)
    setShowCustomerDropdown(false)
    setCustomerSearch("")
    setPage(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(0); setCustomerIdFilter("") }}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          <TabsTrigger value="pending">Đang xử lý</TabsTrigger>
          <TabsTrigger value="stock_reserve_failed">Hết hàng</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm theo mã đơn hàng..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="relative">
          <div className="flex gap-1 items-center">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input placeholder="Tìm KH theo tên/SĐT..." className="w-56" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCustomerSearch()} />
            <Button variant="outline" size="sm" onClick={handleCustomerSearch} disabled={!customerSearch.trim()}>Tìm</Button>
          </div>
          {showCustomerDropdown && customerResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {customerResults.map(c => (
                <button key={c.id} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between" onClick={() => selectCustomer(c)}>
                  <span className="font-medium">{c.fullName}</span>
                  <span className="text-xs text-muted-foreground">{c.phone}</span>
                </button>
              ))}
            </div>
          )}
          {showCustomerDropdown && customerResults.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border rounded-lg shadow-lg p-3 text-sm text-muted-foreground text-center">Không tìm thấy</div>
          )}
        </div>
        <Input type="date" className="w-40" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0) }} />
        <Input type="date" className="w-40" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0) }} />
      </div>
      {selectedCustomer && <Badge variant="secondary" className="text-xs inline-flex items-center gap-1">🔍 KH: {selectedCustomer.fullName} ({selectedCustomer.phone}) <button onClick={clearCustomerFilter}><X className="h-3 w-3" /></button></Badge>}
      <Card><CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50">
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Mã đơn</th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Thời gian</th>
            <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tổng tiền</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thanh toán</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
          </tr></thead><tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3 text-sm font-medium font-mono">{displayOrderId(o)}</td>
                <td className="p-3 text-sm text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : ""}</td>
                <td className="p-3 text-sm text-right font-bold">{formatCurrency(getAmount(o))}</td>
                <td className="p-3 text-center"><Badge variant={METHOD_BADGE[o.paymentMethod] || "secondary"}>{METHOD_LABELS[o.paymentMethod] || o.paymentMethod || "—"}</Badge></td>
                <td className="p-3 text-center"><Badge variant={STATUS_VARIANT[o.status] || "secondary"}>{STATUS_LABELS[o.status] || o.status}</Badge></td>
                <td className="p-3 text-center"><div className="flex justify-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailId(o.id); setShowDetail(true) }}><Eye className="h-4 w-4" /></Button>
                  {o.status === "COMPLETED" && <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => handleCancel(o.id)}>Hủy</Button>}
                </div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Không có đơn hàng nào</td></tr>}
          </tbody></table></div>
        )}
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0) }} label="đơn hàng" />
      </CardContent></Card>
      <OrderDetailDialog open={showDetail} onOpenChange={setShowDetail} orderId={detailId} />
    </div>
  )
}

