import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { exportToExcel, exportToPdf } from "@/lib/export"
import ProductFormDialog from "@/components/products/ProductFormDialog"
import * as productApi from "@/api/productApi"
import { Download, FileText, ImageIcon, Loader2, PackageSearch, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react"
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

  const catMap = Object.fromEntries(categories.map((category) => [category.id, category.name]))

  const resolveCatName = (product) => {
    if (product.categoryName) return product.categoryName
    if (product.categoryIds?.length) {
      const names = product.categoryIds.map((id) => catMap[id]).filter(Boolean)
      return names.length ? names.join(", ") : "—"
    }
    return "—"
  }

  const productInitial = (product) => (product?.name || product?.sku || "S").trim().slice(0, 1).toUpperCase()

  useEffect(() => {
    async function fetchCats() {
      try {
        const roots = await productApi.getRootCategories()
        if (!roots?.length) return
        const childResults = await Promise.allSettled(roots.map((root) => productApi.getCategoryChildren(root.id)))
        const allCats = [...roots]
        childResults.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.length) allCats.push(...result.value)
        })
        setCategories(allCats)
      } catch {
        // Category names are optional decoration in this table.
      }
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
    } catch {
      toast.error("Có lỗi xảy ra")
    }
  }

  const enriched = products.map((product) => ({ ...product, _categoryName: resolveCatName(product) }))

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
      <section className="retail-card overflow-hidden">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
              <PackageSearch className="h-4 w-4" />
              Product command center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Quản lý sản phẩm</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {totalElements.toLocaleString()} sản phẩm trong hệ thống. Theo dõi hình ảnh, SKU, danh mục, giá bán và trạng thái ngay trong một bảng.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-md" onClick={handleExportExcel}>
              <Download className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="rounded-md" onClick={handleExportPdf}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
            <Button className="rounded-md bg-slate-950 font-extrabold text-white hover:bg-primary dark:bg-primary dark:text-primary-foreground" onClick={() => { setEditProduct(null); setShowForm(true) }}>
              <Plus className="h-4 w-4" /> Thêm sản phẩm
            </Button>
          </div>
        </div>
      </section>

      <section className="retail-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
              className="h-10 rounded-md bg-card pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              className="h-10 min-w-[180px] bg-transparent text-sm font-bold outline-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
        </div>
      </section>

      <section className="retail-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-sm font-bold text-muted-foreground">Đang tải danh sách sản phẩm...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-border bg-muted/55">
                  <th className="p-3 text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Sản phẩm</th>
                  <th className="p-3 text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">SKU</th>
                  <th className="p-3 text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Danh mục</th>
                  <th className="p-3 text-right text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Giá bán</th>
                  <th className="p-3 text-center text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Đơn vị</th>
                  <th className="p-3 text-center text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Trạng thái</th>
                  <th className="p-3 text-center text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border transition-colors hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {product.imageUrls?.[0] ? (
                            <img
                              src={product.imageUrls[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.nextElementSibling?.classList.remove("hidden")
                              }}
                            />
                          ) : null}
                          <div className={`${product.imageUrls?.[0] ? "hidden" : ""} grid h-full w-full place-items-center bg-emerald-500/10 text-sm font-extrabold text-emerald-700`}>
                            {productInitial(product)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold">{product.name}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {product.imageUrls?.length ? `${product.imageUrls.length} ảnh` : "Chưa có ảnh"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-sm font-bold text-muted-foreground">{product.sku}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="max-w-[220px] truncate font-bold">{resolveCatName(product)}</Badge>
                    </td>
                    <td className="p-3 text-right text-sm font-extrabold">{formatCurrency(product.price)}</td>
                    <td className="p-3 text-center text-sm font-bold text-muted-foreground">{product.unit || "—"}</td>
                    <td className="p-3 text-center">
                      <Badge variant={product.isActive !== false ? "success" : "destructive"} className="font-extrabold">
                        {product.isActive !== false ? "Đang bán" : "Ngừng bán"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => { setEditProduct(product); setShowForm(true) }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-sm font-bold text-muted-foreground">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
          label="sản phẩm"
        />
      </section>

      <ProductFormDialog open={showForm} onOpenChange={(value) => { setShowForm(value); if (!value) fetchProducts() }} product={editProduct} categories={categories} />
    </div>
  )
}
