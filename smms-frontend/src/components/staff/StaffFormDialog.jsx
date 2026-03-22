import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import * as staffApi from "@/api/staffApi"
import { toast } from "sonner"

export default function StaffFormDialog({ open, onOpenChange, employee = null, departments = [], onSuccess }) {
  const isEdit = !!employee
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", departmentId: "", baseSalary: "", hireDate: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (employee) {
      setForm({
        fullName: employee.fullName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        departmentId: employee.departmentId || "",
        baseSalary: employee.baseSalary || "",
        hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
      })
    } else {
      setForm({ fullName: "", email: "", phone: "", departmentId: departments[0]?.id || "", baseSalary: "", hireDate: "" })
    }
  }, [employee, open, departments])

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.fullName) { toast.error("Vui lòng nhập họ tên"); return }
    setLoading(true)
    try {
      const data = { ...form, baseSalary: Number(form.baseSalary) || 0 }
      if (isEdit) {
        await staffApi.updateEmployee(employee.id, data)
        toast.success("Cập nhật nhân viên thành công!")
      } else {
        await staffApi.createEmployee(data)
        toast.success("Thêm nhân viên thành công!")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error("Có lỗi xảy ra khi lưu nhân viên")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Họ tên <span className="text-destructive">*</span></label>
            <Input className="mt-1" placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input className="mt-1" type="email" placeholder="email@company.com" value={form.email} onChange={e => handleChange("email", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input className="mt-1" placeholder="0901234567" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Phòng ban</label>
              <select className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.departmentId} onChange={e => handleChange("departmentId", e.target.value)}>
                <option value="">Chọn phòng ban</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Lương cơ bản</label>
              <Input className="mt-1" type="number" placeholder="10000000" value={form.baseSalary} onChange={e => handleChange("baseSalary", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Ngày vào làm</label>
            <Input className="mt-1" type="date" value={form.hireDate} onChange={e => handleChange("hireDate", e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm nhân viên"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
