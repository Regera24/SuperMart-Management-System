import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import ImageUpload from "@/components/ui/image-upload"
import * as productApi from "@/api/productApi"
import { toast } from "sonner"

export default function ProductFormDialog({ open, onOpenChange, product = null, categories = [] }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name: "", sku: "", categoryIds: [], price: "", unit: "Cái",
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        sku: product.sku || "",
        categoryIds: product.categoryIds || [],
        price: product.price || "",
        unit: product.unit || "Cái",
      })
      setImages(product.imageUrls?.map((url) => ({ url, name: url })) || [])
    } else {
      setForm({ name: "", sku: "", categoryIds: [], price: "", unit: "Cái" })
      setImages([])
    }
  }, [product, open])

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleCategoryChange = (e) => {
    const val = e.target.value
    handleChange("categoryIds", val ? [val] : [])
  }

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.price) { toast.error("Vui lòng điền đầy đủ thông tin bắt buộc"); return }
    setLoading(true)
    try {
      // Separate new files (need upload) from existing URLs (already uploaded)
      const newFiles = images.filter((img) => img.file).map((img) => img.file)
      const existingUrls = images.filter((img) => img.url && !img.file).map((img) => img.url)

      // Upload new files if any
      let uploadedUrls = []
      if (newFiles.length > 0) {
        uploadedUrls = await productApi.uploadImages(newFiles)
      }

      const allImageUrls = [...existingUrls, ...uploadedUrls]
      const data = { ...form, price: Number(form.price), imageUrls: allImageUrls }

      if (isEdit) {
        await productApi.updateProduct(product.id, data)
        toast.success("Cập nhật sản phẩm thành công!")
      } else {
        await productApi.createProduct(data)
        toast.success("Thêm sản phẩm thành công!")
      }
      onOpenChange(false)
    } catch {
      toast.error("Có lỗi xảy ra khi lưu sản phẩm")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle></DialogHeader>
        <div className="space-y-5 py-2">
          <div><label className="text-sm font-medium mb-2 block">Ảnh sản phẩm</label><ImageUpload value={images} onChange={setImages} maxFiles={5} maxSizeMB={5} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Tên sản phẩm <span className="text-destructive">*</span></label><Input className="mt-1" placeholder="VD: Coca-Cola 330ml" value={form.name} onChange={(e) => handleChange("name", e.target.value)} /></div>
            <div><label className="text-sm font-medium">Mã SKU <span className="text-destructive">*</span></label><Input className="mt-1" placeholder="VD: BEV-001" value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Giá bán <span className="text-destructive">*</span></label><Input className="mt-1" type="number" placeholder="12000" value={form.price} onChange={(e) => handleChange("price", e.target.value)} /></div>
            <div><label className="text-sm font-medium">Đơn vị</label><select className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.unit} onChange={(e) => handleChange("unit", e.target.value)}><option>Cái</option><option>Lon</option><option>Chai</option><option>Gói</option><option>Hộp</option><option>Kg</option></select></div>
            <div><label className="text-sm font-medium">Danh mục</label>
              <select className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.categoryIds[0] || ""} onChange={handleCategoryChange}>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">{loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm sản phẩm"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
