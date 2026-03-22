import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { exportToExcel, exportToPdf } from "@/lib/export"
import ProductFormDialog from "@/components/products/ProductFormDialog"
import * as productApi from "@/api/productApi"
import { Search, Plus, Pencil, Trash2, Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Pagination from "@/components/ui/pagination"

const PRODUCT_COLUMNS = [
  { key: "name", label: "Sản phẩm" },
  { key: "sku", label: "SKU" },
  { key: "_categoryName", label: "Danh mục" },
  { key: "price", label: "Giá bán", format: (v) => new Intl.NumberFormat("vi-VN").format(Number(v) || 0) + " ₫" },
  { key: "unit", label: "Đơn vị" },
  { key: "isActive", label: "Trạng thái", format: (v) => v ? "Đang bán" : "Ngừng bán" },
]



export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  // Build categoryId → name map
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

  // Resolve category name for a product
  const resolveCatName = (p) => {
    if (p.categoryName) return p.categoryName
    if (p.categoryIds?.length) {
      const names = p.categoryIds.map(id => catMap[id]).filter(Boolean)
      return names.length ? names.join(", ") : "—"
    }
    return "—"
  }

  // Fetch categories once (root + children)
  useEffect(() => {
    async function fetchCats() {
      try {
        const roots = await productApi.getRootCategories()
        if (!roots?.length) return
        // Fetch children for each root
        const childResults = await Promise.allSettled(
          roots.map(r => productApi.getCategoryChildren(r.id))
        )
        const allCats = [...roots]
        childResults.forEach(r => {
          if (r.status === "fulfilled" && r.value?.length) allCats.push(...r.value)
        })
        setCategories(allCats)
      } catch { /* ignore */ }
    }
    fetchCats()
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: pageSize }
      if (search) params.keyword = search
      if (statusFilter) params.isActive = statusFilter === "active"
      const result = await productApi.getProducts(params)
      setProducts(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setProducts([])
      setTotalElements(0)
      toast.error("Không thể tải danh sách sản phẩm")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận ngừng bán sản phẩm này?")) return
    try {
      await productApi.deactivateProduct(id)
      toast.success("Đã ngừng bán sản phẩm")
      fetchProducts()
    } catch { toast.error("Có lỗi xảy ra") }
  }

  // For export: enrich products with _categoryName
  const enriched = products.map(p => ({ ...p, _categoryName: resolveCatName(p) }))

  const handleExportExcel = () => {
    exportToExcel(enriched, PRODUCT_COLUMNS, "san_pham", "Sản phẩm")
    toast.success("Xuất Excel thành công!", { description: `${products.length} sản phẩm` })
  }
  const handleExportPdf = () => {
    exportToPdf(enriched, PRODUCT_COLUMNS, "san_pham", { title: "Danh sách Sản phẩm", subtitle: `Tổng: ${totalElements} sản phẩm` })
    toast.success("Xuất PDF thành công!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1><p className="text-sm text-muted-foreground">{totalElements} sản phẩm</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={() => { setEditProduct(null); setShowForm(true) }}><Plus className="h-4 w-4 mr-2" /> Thêm sản phẩm</Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm sản phẩm..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></div>
        <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}>
          <option value="">Tất cả trạng thái</option><option value="active">Đang bán</option><option value="inactive">Ngừng bán</option>
        </select>
      </div>

      <Card><CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Đang tải...</span></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50">
            <th className="p-3 w-8"><input type="checkbox" className="rounded" /></th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Sản phẩm</th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">SKU</th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Danh mục</th>
            <th className="p-3 text-right text-xs font-medium text-muted-foreground">Giá bán</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Đơn vị</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
          </tr></thead><tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3"><input type="checkbox" className="rounded" /></td>
                <td className="p-3"><span className="text-sm font-medium">{p.name}</span></td>
                <td className="p-3 text-sm text-muted-foreground font-mono">{p.sku}</td>
                <td className="p-3"><Badge variant="secondary">{resolveCatName(p)}</Badge></td>
                <td className="p-3 text-sm text-right font-medium">{formatCurrency(p.price)}</td>
                <td className="p-3 text-sm text-center text-muted-foreground">{p.unit || "—"}</td>
                <td className="p-3 text-center"><Badge variant={p.isActive !== false ? "success" : "destructive"}>{p.isActive !== false ? "Đang bán" : "Ngừng bán"}</Badge></td>
                <td className="p-3"><div className="flex justify-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(p); setShowForm(true) }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Không tìm thấy sản phẩm nào</td></tr>}
          </tbody></table></div>
        )}
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0) }} label="sản phẩm" />
      </CardContent></Card>

      <ProductFormDialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) fetchProducts() }} product={editProduct} categories={categories} />
    </div>
  )
}
