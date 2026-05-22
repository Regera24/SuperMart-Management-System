import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as inventoryApi from "@/api/inventoryApi"
import * as productApi from "@/api/productApi"
import * as XLSX from "xlsx"
import { Search, Download, FileText, AlertTriangle, Package, RefreshCw, Loader2, Plus, Pencil, Trash2, Truck, Warehouse, ClipboardList, CheckCircle, Upload } from "lucide-react"
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
  const [suppliers, setSuppliers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [receipts, setReceipts] = useState({ content: [], totalPages: 1, totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("stock")

  // Supplier dialog state
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState(null)
  const [supplierForm, setSupplierForm] = useState({ name: "", contactInfo: "" })

  // Warehouse dialog state
  const [showWarehouseForm, setShowWarehouseForm] = useState(false)
  const [editWarehouse, setEditWarehouse] = useState(null)
  const [warehouseForm, setWarehouseForm] = useState({ name: "", location: "" })

  // Import receipt dialog state
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [receiptForm, setReceiptForm] = useState({ supplierId: "", warehouseId: "", note: "", items: [{ productSku: "", productName: "", quantity: 1, unitCost: 0 }] })

  // Product search state for receipt items
  const [allProducts, setAllProducts] = useState([])
  const [productSearchIdx, setProductSearchIdx] = useState(-1)
  const [productSearchText, setProductSearchText] = useState("")
  const [productSearchResults, setProductSearchResults] = useState([])
  const excelFileRef = useRef(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [stockRes, lowRes, suppRes, whRes, rcptRes, prodRes] = await Promise.allSettled([
        inventoryApi.getStock(1),
        inventoryApi.getLowStock(10),
        inventoryApi.getSuppliers(),
        inventoryApi.getWarehouses(),
        inventoryApi.getImportReceipts({ page: 0, size: 50 }),
        productApi.getProducts({ page: 0, size: 200 }),
      ])
      setStock(stockRes.status === "fulfilled" ? stockRes.value || [] : [])
      setLowStock(lowRes.status === "fulfilled" ? lowRes.value || [] : [])
      setSuppliers(suppRes.status === "fulfilled" ? suppRes.value || [] : [])
      setWarehouses(whRes.status === "fulfilled" ? whRes.value || [] : [])
      if (rcptRes.status === "fulfilled" && rcptRes.value) setReceipts(rcptRes.value)
      if (prodRes.status === "fulfilled") setAllProducts(prodRes.value?.content || [])
    } catch { toast.error("Không thể tải dữ liệu") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const getSku = (s) => s.productSku || s.sku || "—"
  const getQty = (s) => s.quantityOnHand ?? s.quantity ?? 0
  const filtered = stock.filter(s => !search || getSku(s).toLowerCase().includes(search.toLowerCase()))
  const outOfStockCount = stock.filter(s => getQty(s) <= 0).length

  const handleExportExcel = () => { exportToExcel(filtered, STOCK_COLUMNS, "ton_kho", "Tồn kho"); toast.success("Xuất Excel thành công!") }
  const handleExportPdf = () => { exportToPdf(filtered, STOCK_COLUMNS, "ton_kho", { title: "Báo cáo Tồn kho" }); toast.success("Xuất PDF thành công!") }

  const handleAdjust = async (item) => {
    const sku = getSku(item)
    const qty = prompt(`Điều chỉnh số lượng cho ${sku}:`, getQty(item))
    if (qty === null) return
    try {
      await inventoryApi.adjustStock({ warehouseId: 1, sku, adjustedQuantity: parseInt(qty), reason: "Điều chỉnh thủ công" })
      toast.success("Đã điều chỉnh tồn kho")
      fetchAll()
    } catch { toast.error("Có lỗi xảy ra") }
  }

  // ── Supplier CRUD ──
  const openSupplierForm = (s = null) => {
    setEditSupplier(s)
    setSupplierForm(s ? { name: s.name, contactInfo: s.contactInfo || "" } : { name: "", contactInfo: "" })
    setShowSupplierForm(true)
  }
  const saveSupplier = async () => {
    try {
      if (editSupplier) await inventoryApi.updateSupplier(editSupplier.id, supplierForm)
      else await inventoryApi.createSupplier(supplierForm)
      toast.success(editSupplier ? "Đã cập nhật NCC" : "Đã thêm NCC")
      setShowSupplierForm(false)
      fetchAll()
    } catch { toast.error("Lỗi khi lưu NCC") }
  }
  const handleDeleteSupplier = async (id) => {
    if (!confirm("Xác nhận xoá nhà cung cấp?")) return
    try { await inventoryApi.deleteSupplier(id); toast.success("Đã xoá NCC"); fetchAll() }
    catch { toast.error("Không thể xoá NCC") }
  }

  // ── Warehouse CRUD ──
  const openWarehouseForm = (w = null) => {
    setEditWarehouse(w)
    setWarehouseForm(w ? { name: w.name, location: w.location || "" } : { name: "", location: "" })
    setShowWarehouseForm(true)
  }
  const saveWarehouse = async () => {
    try {
      if (editWarehouse) await inventoryApi.updateWarehouse(editWarehouse.id, warehouseForm)
      else await inventoryApi.createWarehouse(warehouseForm)
      toast.success(editWarehouse ? "Đã cập nhật kho" : "Đã thêm kho")
      setShowWarehouseForm(false)
      fetchAll()
    } catch { toast.error("Lỗi khi lưu kho") }
  }

  // ── Import Receipt ──
  const addReceiptItem = () => setReceiptForm(f => ({ ...f, items: [...f.items, { productSku: "", productName: "", quantity: 1, unitCost: 0 }] }))
  const updateReceiptItem = (idx, field, val) => setReceiptForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }))
  const removeReceiptItem = (idx) => setReceiptForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))

  // Product search for receipt row
  const handleProductSearch = (idx, text) => {
    setProductSearchIdx(idx)
    setProductSearchText(text)
    if (!text.trim()) { setProductSearchResults([]); return }
    const q = text.toLowerCase()
    const matches = allProducts.filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)).slice(0, 8)
    setProductSearchResults(matches)
  }
  const selectProduct = (idx, p) => {
    setReceiptForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, productSku: p.sku, productName: p.name, unitCost: p.costPrice || p.price || it.unitCost } : it) }))
    setProductSearchIdx(-1)
    setProductSearchResults([])
    setProductSearchText("")
  }

  // Excel import
  const handleExcelImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws)
        if (!rows.length) { toast.error("File Excel trống"); return }
        const items = rows.map(r => ({
          productSku: String(r["SKU"] || r["sku"] || r["Mã SP"] || "").trim(),
          productName: String(r["Tên SP"] || r["Tên sản phẩm"] || r["name"] || r["productName"] || "").trim(),
          quantity: parseInt(r["SL"] || r["Số lượng"] || r["quantity"] || 1) || 1,
          unitCost: parseFloat(r["Đơn giá"] || r["Giá nhập"] || r["unitCost"] || r["price"] || 0) || 0,
        })).filter(it => it.productSku || it.productName)
        if (!items.length) { toast.error("Không tìm thấy dữ liệu hợp lệ. Cần cột: SKU, Tên SP, SL, Đơn giá"); return }
        setReceiptForm(f => ({ ...f, items }))
        toast.success(`Đã nhập ${items.length} sản phẩm từ Excel`)
      } catch { toast.error("Lỗi đọc file Excel") }
    }
    reader.readAsArrayBuffer(file)
    if (excelFileRef.current) excelFileRef.current.value = ""
  }

  const downloadExcelTemplate = () => {
    const templateData = [
      { "SKU": "SP001", "Tên SP": "Sản phẩm mẫu", "SL": 10, "Đơn giá": 50000 },
      { "SKU": "SP002", "Tên SP": "Sản phẩm 2", "SL": 5, "Đơn giá": 120000 },
    ]
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Nhập kho")
    XLSX.writeFile(wb, "mau_nhap_kho.xlsx")
    toast.success("Đã tải mẫu Excel")
  }

  const saveReceipt = async () => {
    try {
      await inventoryApi.createImportReceipt({
        supplierId: parseInt(receiptForm.supplierId),
        warehouseId: parseInt(receiptForm.warehouseId),
        note: receiptForm.note,
        items: receiptForm.items.map(it => ({ productSku: it.productSku, quantity: parseInt(it.quantity), importPrice: parseFloat(it.unitCost) || 0 })),
      })
      toast.success("Đã tạo phiếu nhập")
      setShowReceiptForm(false)
      setReceiptForm({ supplierId: "", warehouseId: "", note: "", items: [{ productSku: "", productName: "", quantity: 1, unitCost: 0 }] })
      fetchAll()
    } catch { toast.error("Lỗi khi tạo phiếu nhập") }
  }

  const handleApproveReceipt = async (id) => {
    if (!confirm("Xác nhận duyệt phiếu nhập? Số lượng hàng sẽ được cộng vào kho.")) return
    try { await inventoryApi.approveImportReceipt(id); toast.success("Đã duyệt phiếu nhập"); fetchAll() }
    catch { toast.error("Không thể duyệt phiếu nhập") }
  }

  const kpis = [
    { label: "Tổng SKU", value: stock.length, icon: Package, color: "text-blue-500" },
    { label: "Sắp hết hàng", value: lowStock.length, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Hết hàng", value: outOfStockCount, icon: AlertTriangle, color: "text-red-500" },
    { label: "Nhà cung cấp", value: suppliers.length, icon: Truck, color: "text-emerald-500" },
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg p-2.5 bg-muted"><k.icon className={`h-5 w-5 ${k.color}`} /></div><div><p className="text-2xl font-bold">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div></CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="stock">Tồn kho</TabsTrigger>
          <TabsTrigger value="alerts">Cảnh báo <Badge variant="destructive" className="ml-1">{lowStock.length}</Badge></TabsTrigger>
          <TabsTrigger value="suppliers"><Truck className="h-3.5 w-3.5 mr-1" /> NCC</TabsTrigger>
          <TabsTrigger value="warehouses"><Warehouse className="h-3.5 w-3.5 mr-1" /> Kho</TabsTrigger>
          <TabsTrigger value="receipts"><ClipboardList className="h-3.5 w-3.5 mr-1" /> Phiếu nhập</TabsTrigger>
        </TabsList>

        {/* ── Stock Tab ── */}
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
                const qty = getQty(s); const available = s.availableQuantity ?? qty
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
              {filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Không có dữ liệu tồn kho</td></tr>}
            </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ── Alerts Tab ── */}
        <TabsContent value="alerts" className="mt-4 space-y-3">
          {lowStock.map((s) => (
            <Card key={getSku(s)} className="border-amber-500/30"><CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-500" /><p className="text-sm font-medium font-mono">{getSku(s)}</p></div>
              <Badge variant="destructive" className="font-bold">Còn {getQty(s)}</Badge>
            </CardContent></Card>
          ))}
          {lowStock.length === 0 && <p className="text-center text-muted-foreground py-10">Không có cảnh báo tồn kho</p>}
        </TabsContent>

        {/* ── Suppliers Tab ── */}
        <TabsContent value="suppliers" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={() => openSupplierForm()}><Plus className="h-4 w-4 mr-2" /> Thêm NCC</Button>
          </div>
          <Card><CardContent className="p-0">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Tên nhà cung cấp</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Thông tin liên hệ</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
            </tr></thead><tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm text-muted-foreground">{s.id}</td>
                  <td className="p-3 text-sm font-medium">{s.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{s.contactInfo || "—"}</td>
                  <td className="p-3"><div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSupplierForm(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteSupplier(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></td>
                </tr>
              ))}
              {suppliers.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">Chưa có nhà cung cấp</td></tr>}
            </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ── Warehouses Tab ── */}
        <TabsContent value="warehouses" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white" onClick={() => openWarehouseForm()}><Plus className="h-4 w-4 mr-2" /> Thêm kho</Button>
          </div>
          <Card><CardContent className="p-0">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Tên kho</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Địa chỉ</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
            </tr></thead><tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm text-muted-foreground">{w.id}</td>
                  <td className="p-3 text-sm font-medium">{w.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{w.location || "—"}</td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openWarehouseForm(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {warehouses.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">Chưa có kho hàng</td></tr>}
            </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ── Import Receipts Tab ── */}
        <TabsContent value="receipts" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white" onClick={() => setShowReceiptForm(true)}><Plus className="h-4 w-4 mr-2" /> Tạo phiếu nhập</Button>
          </div>
          <Card><CardContent className="p-0">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">NCC</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Kho</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Ghi chú</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
            </tr></thead><tbody>
              {(receipts.content || []).map((r) => (
                <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm text-muted-foreground">{r.id}</td>
                  <td className="p-3 text-sm font-medium">{r.supplierName || r.supplierId}</td>
                  <td className="p-3 text-sm text-muted-foreground">{r.warehouseName || r.warehouseId}</td>
                  <td className="p-3 text-sm text-muted-foreground">{r.note || "—"}</td>
                  <td className="p-3 text-center"><Badge variant={r.status === "APPROVED" ? "success" : "secondary"}>{r.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}</Badge></td>
                  <td className="p-3 text-center">
                    {r.status !== "APPROVED" && (
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50" onClick={() => handleApproveReceipt(r.id)}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Duyệt
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {(receipts.content || []).length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Chưa có phiếu nhập</td></tr>}
            </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ── Supplier Form Dialog ── */}
      <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editSupplier ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Tên NCC *</label><Input value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} placeholder="Nhập tên nhà cung cấp" /></div>
            <div><label className="text-sm font-medium">Thông tin liên hệ</label><Input value={supplierForm.contactInfo} onChange={e => setSupplierForm(f => ({ ...f, contactInfo: e.target.value }))} placeholder="Email, SĐT..." /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSupplierForm(false)}>Huỷ</Button>
              <Button onClick={saveSupplier} disabled={!supplierForm.name}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Warehouse Form Dialog ── */}
      <Dialog open={showWarehouseForm} onOpenChange={setShowWarehouseForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editWarehouse ? "Sửa kho hàng" : "Thêm kho hàng"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Tên kho *</label><Input value={warehouseForm.name} onChange={e => setWarehouseForm(f => ({ ...f, name: e.target.value }))} placeholder="Nhập tên kho" /></div>
            <div><label className="text-sm font-medium">Địa chỉ</label><Input value={warehouseForm.location} onChange={e => setWarehouseForm(f => ({ ...f, location: e.target.value }))} placeholder="Nhập địa chỉ kho" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWarehouseForm(false)}>Huỷ</Button>
              <Button onClick={saveWarehouse} disabled={!warehouseForm.name}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Import Receipt Form Dialog ── */}
      <Dialog open={showReceiptForm} onOpenChange={(v) => { setShowReceiptForm(v); setProductSearchIdx(-1); setProductSearchResults([]) }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tạo phiếu nhập hàng</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nhà cung cấp *</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={receiptForm.supplierId} onChange={e => setReceiptForm(f => ({ ...f, supplierId: e.target.value }))}>
                  <option value="">Chọn NCC</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Kho hàng *</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={receiptForm.warehouseId} onChange={e => setReceiptForm(f => ({ ...f, warehouseId: e.target.value }))}>
                  <option value="">Chọn kho</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-sm font-medium">Ghi chú</label><Input value={receiptForm.note} onChange={e => setReceiptForm(f => ({ ...f, note: e.target.value }))} placeholder="Ghi chú phiếu nhập" /></div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Danh sách sản phẩm ({receiptForm.items.length})</label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={downloadExcelTemplate}><Download className="h-3.5 w-3.5 mr-1" /> Mẫu Excel</Button>
                  <input ref={excelFileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelImport} />
                  <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-600" onClick={() => excelFileRef.current?.click()}><Upload className="h-3.5 w-3.5 mr-1" /> Nhập Excel</Button>
                  <Button size="sm" variant="outline" onClick={addReceiptItem}><Plus className="h-3.5 w-3.5 mr-1" /> Thêm SP</Button>
                </div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 mb-1 px-1">
                <span className="col-span-4 text-xs font-medium text-muted-foreground">Sản phẩm (gõ tên để tìm)</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">SKU</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">Số lượng</span>
                <span className="col-span-3 text-xs font-medium text-muted-foreground">Đơn giá (₫)</span>
                <span className="col-span-1"></span>
              </div>

              <div className="space-y-2">
                {receiptForm.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center relative">
                    <div className="col-span-4 relative">
                      <Input
                        placeholder="Gõ tên sản phẩm..."
                        value={productSearchIdx === idx ? productSearchText : it.productName}
                        onChange={e => { handleProductSearch(idx, e.target.value); updateReceiptItem(idx, "productName", e.target.value) }}
                        onFocus={() => { setProductSearchIdx(idx); setProductSearchText(it.productName) }}
                        onBlur={() => setTimeout(() => { if (productSearchIdx === idx) setProductSearchIdx(-1) }, 200)}
                      />
                      {productSearchIdx === idx && productSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {productSearchResults.map(p => (
                            <button key={p.id} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onMouseDown={() => selectProduct(idx, p)}>
                              <span className="font-medium">{p.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">SKU: {p.sku}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input className="col-span-2 font-mono text-xs" placeholder="SKU" value={it.productSku} onChange={e => updateReceiptItem(idx, "productSku", e.target.value)} />
                    <Input className="col-span-2" type="number" placeholder="SL" min={1} value={it.quantity} onChange={e => updateReceiptItem(idx, "quantity", e.target.value)} />
                    <Input className="col-span-3" type="number" placeholder="Đơn giá" value={it.unitCost} onChange={e => updateReceiptItem(idx, "unitCost", e.target.value)} />
                    <Button variant="ghost" size="icon" className="col-span-1 h-8 w-8 text-destructive" onClick={() => removeReceiptItem(idx)} disabled={receiptForm.items.length <= 1}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>

              {/* Total summary */}
              {receiptForm.items.length > 0 && (
                <div className="flex justify-end pt-2 border-t mt-3">
                  <div className="text-sm text-muted-foreground">
                    Tổng: <span className="font-bold text-foreground">{receiptForm.items.reduce((s, it) => s + (parseInt(it.quantity) || 0), 0)}</span> SP •
                    Giá trị: <span className="font-bold text-foreground">{new Intl.NumberFormat("vi-VN").format(receiptForm.items.reduce((s, it) => s + (parseInt(it.quantity) || 0) * (parseFloat(it.unitCost) || 0), 0))} ₫</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReceiptForm(false)}>Huỷ</Button>
              <Button onClick={saveReceipt} disabled={!receiptForm.supplierId || !receiptForm.warehouseId || !receiptForm.items[0]?.productSku}>Tạo phiếu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
