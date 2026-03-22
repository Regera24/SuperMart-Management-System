import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as inventoryApi from "@/api/inventoryApi"
import { Search, Download, FileText, AlertTriangle, Package, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

const STOCK_COLUMNS = [
  { key: "productSku", label: "SKU" },
  { key: "quantityOnHand", label: "Tồn kho" },
  { key: "reservedQuantity", label: "Đã giữ" },
  { key: "availableQuantity", label: "Khả dụng" },
]



export default function InventoryPage() {
  const [stock, setStock] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("stock")

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const [stockRes, lowRes] = await Promise.allSettled([
          inventoryApi.getStock(1),
          inventoryApi.getLowStock(10),
        ])
        if (stockRes.status === "fulfilled" && stockRes.value?.length) setStock(stockRes.value)
        else setStock([])
        if (lowRes.status === "fulfilled" && lowRes.value?.length) setLowStock(lowRes.value)
        else setLowStock([])
      } catch {
        setStock([])
        setLowStock([])
        toast.error("Không thể tải dữ liệu tồn kho")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // Normalize field names for compatibility
  const getSku = (s) => s.productSku || s.sku || "—"
  const getQty = (s) => s.quantityOnHand ?? s.quantity ?? 0
  const getThreshold = (s) => s.threshold ?? s.minQuantity ?? 10

  const filtered = stock.filter(s => {
    const sku = getSku(s)
    return !search || sku.toLowerCase().includes(search.toLowerCase())
  })

  const handleExportExcel = () => { exportToExcel(filtered, STOCK_COLUMNS, "ton_kho", "Tồn kho"); toast.success("Xuất Excel thành công!") }
  const handleExportPdf = () => { exportToPdf(filtered, STOCK_COLUMNS, "ton_kho", { title: "Báo cáo Tồn kho" }); toast.success("Xuất PDF thành công!") }

  const handleAdjust = async (item) => {
    const sku = getSku(item)
    const qty = prompt(`Điều chỉnh số lượng cho ${sku}:`, getQty(item))
    if (qty === null) return
    try {
      await inventoryApi.adjustStock({ warehouseId: 1, sku, adjustedQuantity: parseInt(qty), reason: "Điều chỉnh thủ công" })
      toast.success("Đã điều chỉnh tồn kho")
    } catch { toast.error("Có lỗi xảy ra") }
  }

  const outOfStockCount = stock.filter(s => getQty(s) <= 0).length

  const kpis = [
    { label: "Tổng SKU", value: stock.length, icon: Package, color: "text-blue-500" },
    { label: "Sắp hết hàng", value: lowStock.length, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Hết hàng", value: outOfStockCount, icon: AlertTriangle, color: "text-red-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Tồn kho</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2.5 bg-muted"><k.icon className={`h-5 w-5 ${k.color}`} /></div><div><p className="text-2xl font-bold">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div></CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="stock">Tồn kho</TabsTrigger><TabsTrigger value="alerts">Cảnh báo <Badge variant="destructive" className="ml-1">{lowStock.length}</Badge></TabsTrigger></TabsList>
        <TabsContent value="stock" className="mt-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm theo SKU..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
          <Card><CardContent className="p-0">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">SKU</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tồn kho</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Đã giữ</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Khả dụng</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
            </tr></thead><tbody>
              {filtered.map((s) => {
                const qty = getQty(s)
                const available = s.availableQuantity ?? qty
                const level = qty <= 0 ? "destructive" : qty < 10 ? "warning" : "success"
                const label = qty <= 0 ? "Hết hàng" : qty < 10 ? "Sắp hết" : "Đủ hàng"
                return (
                  <tr key={s.id || getSku(s)} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-sm font-mono font-medium">{getSku(s)}</td>
                    <td className={`p-3 text-sm text-right font-bold ${level === "destructive" ? "text-red-500" : level === "warning" ? "text-amber-500" : ""}`}>{qty}</td>
                    <td className="p-3 text-sm text-right text-muted-foreground">{s.reservedQuantity ?? 0}</td>
                    <td className="p-3 text-sm text-right font-medium">{available}</td>
                    <td className="p-3 text-center"><Badge variant={level}>{label}</Badge></td>
                    <td className="p-3 text-center"><Button variant="ghost" size="sm" onClick={() => handleAdjust(s)}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Điều chỉnh</Button></td>
                  </tr>
                )
              })}
            </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="alerts" className="mt-4 space-y-3">
          {lowStock.map((s) => {
            const sku = getSku(s)
            const qty = getQty(s)
            return (
            <Card key={sku} className="border-amber-500/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div><p className="text-sm font-medium font-mono">{sku}</p></div>
                </div>
                <Badge variant="destructive" className="font-bold">Còn {qty}</Badge>
              </CardContent>
            </Card>
          )})}
          {lowStock.length === 0 && <p className="text-center text-muted-foreground py-10">Không có cảnh báo tồn kho</p>}
        </TabsContent>
      </Tabs>
    </div>
  )
}
