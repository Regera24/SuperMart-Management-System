import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import * as userApi from "@/api/userApi"
import { toast } from "sonner"

const ROLES = [
  { value: "ADMIN", label: "Quản trị" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "CASHIER", label: "Thu ngân" },
]

export default function UserFormDialog({ open, onOpenChange, user = null, onSuccess }) {
  const isEdit = !!user
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", roles: ["CASHIER"] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || "", email: user.email || "", phone: user.phone || "", password: "", roles: user.roles || ["CASHIER"] })
    } else {
      setForm({ username: "", email: "", phone: "", password: "", roles: ["CASHIER"] })
    }
  }, [user, open])

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleRoleToggle = (role) => {
    setForm(prev => {
      const roles = prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role]
      return { ...prev, roles: roles.length ? roles : [role] }
    })
  }

  const handleSubmit = async () => {
    if (!form.username || !form.email) { toast.error("Vui lòng nhập tên đăng nhập và email"); return }
    if (!isEdit && !form.password) { toast.error("Vui lòng nhập mật khẩu"); return }
    setLoading(true)
    try {
      const data = { ...form }
      if (isEdit && !data.password) delete data.password
      if (isEdit) {
        await userApi.updateUser(user.id, data)
        toast.success("Cập nhật tài khoản thành công!")
      } else {
        await userApi.createUser(data)
        toast.success("Tạo tài khoản thành công!")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error("Có lỗi xảy ra khi lưu tài khoản")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Tên đăng nhập <span className="text-destructive">*</span></label>
            <Input className="mt-1" placeholder="username" value={form.username} onChange={e => handleChange("username", e.target.value)} disabled={isEdit} />
          </div>
          <div>
            <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
            <Input className="mt-1" type="email" placeholder="email@example.com" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <Input className="mt-1" placeholder="0901234567" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{isEdit ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"} {!isEdit && <span className="text-destructive">*</span>}</label>
            <Input className="mt-1" type="password" placeholder="••••••••" value={form.password} onChange={e => handleChange("password", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Vai trò</label>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <Button key={r.value} type="button" size="sm" variant={form.roles.includes(r.value) ? "default" : "outline"} onClick={() => handleRoleToggle(r.value)}>
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
