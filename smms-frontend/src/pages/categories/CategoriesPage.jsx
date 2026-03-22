import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as productApi from "@/api/productApi"
import { Plus, Pencil, Trash2, FolderOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"



export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [productCounts, setProductCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const [catsRes, prodsRes] = await Promise.allSettled([
          productApi.getRootCategories(),
          productApi.getProducts({ page: 0, size: 1000 }),
        ])
        const cats = catsRes.status === "fulfilled" && catsRes.value?.length ? catsRes.value : []
        setCategories(cats)

        // Count products per category by scanning product.categoryIds
        if (prodsRes.status === "fulfilled" && prodsRes.value?.content?.length) {
          const counts = {}
          prodsRes.value.content.forEach(p => {
            (p.categoryIds || []).forEach(cid => { counts[cid] = (counts[cid] || 0) + 1 })
          })
          setProductCounts(counts)
        }
      } catch { setCategories([]); toast.error("Không thể tải danh mục") }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handleCreate = async () => {
    const name = prompt("Tên danh mục:")
    if (!name) return
    try {
      await productApi.createCategory({ name })
      toast.success("Đã tạo danh mục")
      const cats = await productApi.getRootCategories()
      setCategories(cats)
    } catch { toast.error("Có lỗi xảy ra") }
  }

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa danh mục?")) return
    try {
      await productApi.deleteCategory(id)
      toast.success("Đã xóa danh mục")
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch { toast.error("Không thể xóa (danh mục có sản phẩm)") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quản lý Danh mục</h1><p className="text-sm text-muted-foreground">{categories.length} danh mục</p></div>
        <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> Thêm danh mục</Button>
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-lg transition-all hover:-translate-y-0.5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" />{cat.name}</div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { const name = prompt("Sửa tên danh mục:", cat.name); if (!name || name === cat.name) return; try { await productApi.updateCategory(cat.id, { name }); toast.success("Đã cập nhật"); const cats = await productApi.getRootCategories(); setCategories(cats) } catch { toast.error("Lỗi cập nhật") } }}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cat.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cat.slug && <p className="text-sm text-muted-foreground mb-3 font-mono">{cat.slug}</p>}
              <Badge variant="secondary">{productCounts[cat.id] || 0} sản phẩm</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}
