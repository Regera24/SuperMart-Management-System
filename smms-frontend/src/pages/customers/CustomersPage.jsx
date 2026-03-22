import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as customerApi from "@/api/customerApi"
import { Search, Plus, Eye, Pencil, Download, FileText, Loader2, Phone } from "lucide-react"
import { toast } from "sonner"
import Pagination from "@/components/ui/pagination"
import CustomerFormDialog from "@/components/customers/CustomerFormDialog"
import CustomerDetailDialog from "@/components/customers/CustomerDetailDialog"

const CUSTOMER_COLUMNS = [
  { key: "fullName", label: "Tên khách hàng" },
  { key: "phone", label: "Số điện thoại" },
  { key: "_tierLabel", label: "Hạng thẻ" },
  { key: "currentPoints", label: "Điểm tích lũy" },
  { key: "_totalSpentFmt", label: "Tổng chi tiêu" },
]

// Backend tier field returns: REGULAR, SILVER, GOLD, DIAMOND
const TIER_COLORS = { REGULAR: "bg-gray-500", BRONZE: "bg-amber-700", SILVER: "bg-gray-400", GOLD: "bg-yellow-500", PLATINUM: "bg-emerald-600", DIAMOND: "bg-purple-600" }
const TIER_LABELS = { REGULAR: "Thường", BRONZE: "Đồng", SILVER: "Bạc", GOLD: "Vàng", PLATINUM: "Bạch kim", DIAMOND: "Kim cương" }



export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [phoneSearch, setPhoneSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailId, setDetailId] = useState(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await customerApi.getCustomers({ page, size: pageSize, search: search || undefined })
      setCustomers(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setCustomers([])
      setTotalElements(0)
      toast.error("Không thể tải danh sách khách hàng")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleSearchPhone = async () => {
    if (!phoneSearch) return
    try {
      const c = await customerApi.getCustomerByPhone(phoneSearch)
      if (c) { setCustomers([c]); setTotalElements(1); toast.success(`Tìm thấy: ${c.fullName || c.phone}`) }
    } catch { toast.error("Không tìm thấy khách hàng") }
  }

  // Resolve tier from customer data
  const getTier = (c) => c.tier || c.loyaltyTier || "REGULAR"
  const getPoints = (c) => c.currentPoints ?? c.loyaltyPoints ?? 0

  // Enrich for export
  const enriched = customers.map(c => ({
    ...c,
    _tierLabel: TIER_LABELS[getTier(c)] || getTier(c),
    _totalSpentFmt: formatCurrency(c.totalSpent),
  }))

  const handleExportExcel = () => { exportToExcel(enriched, CUSTOMER_COLUMNS, "khach_hang", "Khách hàng"); toast.success("Xuất Excel thành công!") }
  const handleExportPdf = () => { exportToPdf(enriched, CUSTOMER_COLUMNS, "khach_hang", { title: "Danh sách Khách hàng" }); toast.success("Xuất PDF thành công!") }

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(-2).toUpperCase() : "KH"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quản lý Khách hàng</h1><p className="text-sm text-muted-foreground">{totalElements} khách hàng</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={() => { setEditCustomer(null); setShowForm(true) }}><Plus className="h-4 w-4 mr-2" /> Thêm khách hàng</Button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm theo tên..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></div>
        <div className="flex gap-1"><Input placeholder="Tìm SĐT..." className="w-40" value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearchPhone()} /><Button variant="outline" size="icon" onClick={handleSearchPhone}><Phone className="h-4 w-4" /></Button></div>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50">
          <th className="p-3 text-left text-xs font-medium text-muted-foreground">Khách hàng</th>
          <th className="p-3 text-left text-xs font-medium text-muted-foreground">SĐT</th>
          <th className="p-3 text-center text-xs font-medium text-muted-foreground">Hạng thẻ</th>
          <th className="p-3 text-right text-xs font-medium text-muted-foreground">Điểm</th>
          <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tổng chi tiêu</th>
          <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
        </tr></thead><tbody>
          {customers.map((c) => {
            const tier = getTier(c)
            const points = getPoints(c)
            return (
            <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="p-3"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(c.fullName)}</AvatarFallback></Avatar><span className="text-sm font-medium">{c.fullName}</span></div></td>
              <td className="p-3 text-sm font-mono">{c.phone}</td>
              <td className="p-3 text-center"><Badge className={`${TIER_COLORS[tier] || "bg-gray-500"} text-white`}>{TIER_LABELS[tier] || tier || "—"}</Badge></td>
              <td className="p-3 text-sm text-right font-bold text-amber-500">{(points).toLocaleString()}</td>
              <td className="p-3 text-sm text-right font-medium">{formatCurrency(c.totalSpent)}</td>
              <td className="p-3"><div className="flex justify-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailId(c.id); setShowDetail(true) }}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCustomer(c); setShowForm(true) }}><Pencil className="h-3.5 w-3.5" /></Button></div></td>
            </tr>
          )})}
          {customers.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Không tìm thấy khách hàng</td></tr>}
        </tbody></table></div>
        )}
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0) }} label="khách hàng" />
      </CardContent></Card>
      <CustomerFormDialog open={showForm} onOpenChange={setShowForm} customer={editCustomer} onSuccess={fetchCustomers} />
      <CustomerDetailDialog open={showDetail} onOpenChange={setShowDetail} customerId={detailId} />
    </div>
  )
}
