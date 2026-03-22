import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import * as customerApi from "@/api/customerApi"
import { toast } from "sonner"

export default function CustomerFormDialog({ open, onOpenChange, customer = null, onSuccess }) {
  const isEdit = !!customer
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", address: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) {
      setForm({
        fullName: customer.fullName || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      })
    } else {
      setForm({ fullName: "", phone: "", email: "", address: "" })
    }
  }, [customer, open])

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.fullName || !form.phone) {
      toast.error("Vui lòng nhập họ tên và số điện thoại")
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await customerApi.updateCustomer(customer.id, form)
        toast.success("Cập nhật khách hàng thành công!")
      } else {
        await customerApi.createCustomer(form)
        toast.success("Thêm khách hàng thành công!")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error("Có lỗi xảy ra khi lưu khách hàng")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Họ tên <span className="text-destructive">*</span></label>
            <Input className="mt-1" placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Số điện thoại <span className="text-destructive">*</span></label>
            <Input className="mt-1" placeholder="0901234567" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input className="mt-1" type="email" placeholder="email@example.com" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <Input className="mt-1" placeholder="123 Đường ABC, Quận 1, TP.HCM" value={form.address} onChange={e => handleChange("address", e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm khách hàng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
