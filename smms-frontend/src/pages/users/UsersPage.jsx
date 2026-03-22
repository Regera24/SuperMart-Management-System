import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as userApi from "@/api/userApi"
import { Search, Plus, Pencil, Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Pagination from "@/components/ui/pagination"
import UserFormDialog from "@/components/users/UserFormDialog"

const USER_COLUMNS = [
  { key: "username", label: "Tên đăng nhập" },
  { key: "email", label: "Email" },
  { key: "phone", label: "SĐT" },
  { key: "roles", label: "Vai trò", format: (v) => (v || []).join(", ") },
  { key: "status", label: "Trạng thái" },
]

const ROLE_COLORS = { ADMIN: "bg-red-500", MANAGER: "bg-blue-500", CASHIER: "bg-emerald-500" }
const ROLE_LABELS = { ADMIN: "Quản trị", MANAGER: "Quản lý", CASHIER: "Thu ngân" }



export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: pageSize }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const result = await userApi.getUsers(params)
      setUsers(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setUsers([])
      setTotalElements(0)
      toast.error("Không thể tải danh sách tài khoản")
    } finally { setLoading(false) }
  }, [page, pageSize, search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await userApi.updateUserStatus(user.id, newStatus)
      toast.success(`Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} tài khoản`)
      fetchUsers()
    } catch {
      toast.error("Có lỗi xảy ra")
    }
  }

  const handleExportExcel = () => { exportToExcel(users, USER_COLUMNS, "tai_khoan"); toast.success("Xuất Excel thành công!") }
  const handleExportPdf = () => { exportToPdf(users, USER_COLUMNS, "tai_khoan", { title: "Danh sách Tài khoản" }); toast.success("Xuất PDF thành công!") }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quản lý Tài khoản</h1><p className="text-sm text-muted-foreground">{totalElements} tài khoản</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={() => { setEditUser(null); setShowForm(true) }}><Plus className="h-4 w-4 mr-2" /> Thêm tài khoản</Button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></div>
        <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}>
          <option value="">Tất cả vai trò</option><option value="ADMIN">Quản trị</option><option value="MANAGER">Quản lý</option><option value="CASHIER">Thu ngân</option>
        </select>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <table className="w-full"><thead><tr className="border-b bg-muted/50">
          <th className="p-3 text-left text-xs font-medium text-muted-foreground">Tên đăng nhập</th>
          <th className="p-3 text-left text-xs font-medium text-muted-foreground">Email</th>
          <th className="p-3 text-left text-xs font-medium text-muted-foreground">SĐT</th>
          <th className="p-3 text-center text-xs font-medium text-muted-foreground">Vai trò</th>
          <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
          <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
        </tr></thead><tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="p-3 text-sm font-medium">{u.username}</td>
              <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
              <td className="p-3 text-sm font-mono">{u.phone || "—"}</td>
              <td className="p-3 text-center"><div className="flex justify-center gap-1">{(u.roles || []).map(r => <Badge key={r} className={`${ROLE_COLORS[r] || "bg-gray-500"} text-white`}>{ROLE_LABELS[r] || r}</Badge>)}</div></td>
              <td className="p-3 text-center"><Switch checked={u.status === "ACTIVE"} onCheckedChange={() => handleToggleStatus(u)} /></td>
              <td className="p-3 text-center"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditUser(u); setShowForm(true) }}><Pencil className="h-3.5 w-3.5" /></Button></td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Không tìm thấy tài khoản</td></tr>}
        </tbody></table>)}
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0) }} label="tài khoản" />
      </CardContent></Card>
      <UserFormDialog open={showForm} onOpenChange={setShowForm} user={editUser} onSuccess={fetchUsers} />
    </div>
  )
}
