import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import * as authApi from "@/api/authApi"
import { User, Lock, Palette, Moon, Sun, Monitor, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [tab, setTab] = useState("profile")
  const [saving, setSaving] = useState(false)

  // Password form
  const [oldPw, setOldPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")

  const handleChangePassword = async () => {
    if (!oldPw || !newPw) { toast.error("Vui lòng nhập đầy đủ mật khẩu"); return }
    if (newPw !== confirmPw) { toast.error("Mật khẩu mới không khớp"); return }
    if (newPw.length < 6) { toast.error("Mật khẩu tối thiểu 6 ký tự"); return }
    setSaving(true)
    try {
      await authApi.changePassword(oldPw, newPw)
      toast.success("Đổi mật khẩu thành công!")
      setOldPw(""); setNewPw(""); setConfirmPw("")
    } catch (err) {
      toast.error(err.response?.data?.message || "Mật khẩu cũ không đúng")
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold">Cài đặt</h1><p className="text-sm text-muted-foreground">Quản lý tài khoản và tùy chỉnh giao diện</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Hồ sơ</TabsTrigger><TabsTrigger value="password"><Lock className="h-4 w-4 mr-1" /> Mật khẩu</TabsTrigger><TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-1" /> Giao diện</TabsTrigger></TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Thông tin cá nhân</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Tên đăng nhập</label><Input className="mt-1" value={user?.username || ""} disabled /></div>
                <div><label className="text-sm font-medium">Vai trò</label><Input className="mt-1" value={(user?.roles || []).join(", ")} disabled /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Email</label><Input className="mt-1" value={user?.email || ""} disabled /></div>
                <div><label className="text-sm font-medium">Số điện thoại</label><Input className="mt-1" value={user?.phone || ""} disabled /></div>
              </div>
              <div><label className="text-sm font-medium">Họ và tên</label><Input className="mt-1" value={user?.fullName || ""} disabled /></div>
              <p className="text-xs text-muted-foreground">Liên hệ Quản trị viên để thay đổi thông tin cá nhân.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Đổi mật khẩu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium">Mật khẩu hiện tại</label><Input className="mt-1" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Nhập mật khẩu hiện tại" /></div>
              <div><label className="text-sm font-medium">Mật khẩu mới</label><Input className="mt-1" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Tối thiểu 6 ký tự" /></div>
              <div><label className="text-sm font-medium">Xác nhận mật khẩu mới</label><Input className="mt-1" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Nhập lại mật khẩu mới" /></div>
              <Button onClick={handleChangePassword} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</> : <><Save className="h-4 w-4 mr-2" />Đổi mật khẩu</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Giao diện</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Chọn chế độ hiển thị:</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ v: "light", icon: Sun, label: "Sáng" }, { v: "dark", icon: Moon, label: "Tối" }, { v: "system", icon: Monitor, label: "Hệ thống" }].map(t => (
                  <button key={t.v} onClick={() => { setTheme(t.v); toast.success(`Đã chuyển: ${t.label}`) }} className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${theme === t.v ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"}`}>
                    <t.icon className={`h-8 w-8 ${theme === t.v ? "text-primary" : "text-muted-foreground"}`} /><span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
