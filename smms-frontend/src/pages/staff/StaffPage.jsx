import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as staffApi from "@/api/staffApi"
import {
  Search, Plus, Pencil, Trash2, Download, FileText, Loader2, Building2,
  Clock, CalendarOff, DollarSign, CalendarClock, CheckCircle2, XCircle, LogIn, LogOut
} from "lucide-react"
import { toast } from "sonner"
import Pagination from "@/components/ui/pagination"
import StaffFormDialog from "@/components/staff/StaffFormDialog"

const EMP_COLUMNS = [
  { key: "fullName", label: "Họ tên" },
  { key: "email", label: "Email" },
  { key: "phone", label: "SĐT" },
  { key: "departmentName", label: "Phòng ban" },
  { key: "_salaryFmt", label: "Lương cơ bản" },
]

const STATUS_COLORS = {
  PENDING: "secondary", APPROVED: "success", REJECTED: "destructive",
  PAID: "success", UNPAID: "secondary",
}

const fmtDate = (d) => d ? new Date(d).toLocaleString("vi-VN") : "—"
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—"

export default function StaffPage() {
  const [tab, setTab] = useState("employees")

  // ── Employees ──
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)

  // ── Attendance ──
  const [attEmpId, setAttEmpId] = useState("")
  const [attLogs, setAttLogs] = useState([])
  const [attLoading, setAttLoading] = useState(false)

  // ── Leave ──
  const [leaveList, setLeaveList] = useState([])
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ employeeId: "", startDate: "", endDate: "", reason: "" })

  // ── Payroll ──
  const [payrollList, setPayrollList] = useState([])
  const [payrollLoading, setPayrollLoading] = useState(false)
  const [payrollForm, setPayrollForm] = useState({ employeeId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), hourlyRate: 50000, bonusAmount: 0 })

  // ── Shifts ──
  const [shifts, setShifts] = useState([])
  const [shiftsLoading, setShiftsLoading] = useState(false)
  const [shiftForm, setShiftForm] = useState({ name: "", startTime: "08:00", endTime: "17:00", description: "" })
  const [assignForm, setAssignForm] = useState({ employeeId: "", shiftId: "", date: "" })

  // ─── Load employees ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [empRes, deptRes] = await Promise.allSettled([
        staffApi.getEmployees({ page, size: pageSize, q: search || undefined }),
        staffApi.getDepartments(),
      ])
      if (empRes.status === "fulfilled") {
        const d = empRes.value
        setEmployees(d.content || [])
        setTotalPages(d.totalPages || 1)
        setTotalElements(d.totalElements || 0)
      } else { setEmployees([]); setTotalElements(0) }
      if (deptRes.status === "fulfilled" && deptRes.value?.length) setDepartments(deptRes.value)
      else setDepartments([])
    } catch { toast.error("Không thể tải dữ liệu") }
    finally { setLoading(false) }
  }, [page, pageSize, search])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Attendance ────────────────────────────────────────────────
  const fetchAttendance = async () => {
    if (!attEmpId) return
    setAttLoading(true)
    try { setAttLogs(await staffApi.getAttendanceLogs(attEmpId)) }
    catch { toast.error("Không tải được chấm công") }
    finally { setAttLoading(false) }
  }

  const handleCheckIn = async () => {
    const eid = prompt("Mã nhân viên (ID):"); if (!eid) return
    try { await staffApi.checkIn({ employeeId: Number(eid) }); toast.success("Check-in thành công!") }
    catch (e) { toast.error(e?.response?.data?.message || "Lỗi check-in") }
  }

  const handleCheckOut = async () => {
    const eid = prompt("Mã nhân viên (ID):"); if (!eid) return
    try { await staffApi.checkOut({ employeeId: Number(eid) }); toast.success("Check-out thành công!") }
    catch (e) { toast.error(e?.response?.data?.message || "Lỗi check-out") }
  }

  // ─── Leave ────────────────────────────────────────────────────
  const fetchLeave = useCallback(async () => {
    setLeaveLoading(true)
    try { setLeaveList(await staffApi.getAllLeaveRequests()) }
    catch { toast.error("Không tải được danh sách nghỉ phép") }
    finally { setLeaveLoading(false) }
  }, [])

  useEffect(() => { if (tab === "leave") fetchLeave() }, [tab, fetchLeave])

  const handleSubmitLeave = async () => {
    try {
      await staffApi.submitLeaveRequest({ ...leaveForm, employeeId: Number(leaveForm.employeeId) })
      toast.success("Đã gửi yêu cầu nghỉ phép")
      setLeaveForm({ employeeId: "", startDate: "", endDate: "", reason: "" })
      fetchLeave()
    } catch (e) { toast.error(e?.response?.data?.message || "Lỗi") }
  }

  // ─── Payroll ─────────────────────────────────────────────────
  const fetchPayroll = useCallback(async () => {
    setPayrollLoading(true)
    try { setPayrollList(await staffApi.getAllPayroll()) }
    catch { toast.error("Không tải được bảng lương") }
    finally { setPayrollLoading(false) }
  }, [])

  useEffect(() => { if (tab === "payroll") fetchPayroll() }, [tab, fetchPayroll])

  const handleGeneratePayroll = async () => {
    try {
      await staffApi.generatePayroll({ ...payrollForm, employeeId: Number(payrollForm.employeeId), hourlyRate: Number(payrollForm.hourlyRate), bonusAmount: Number(payrollForm.bonusAmount) })
      toast.success("Tính lương thành công!")
      fetchPayroll()
    } catch (e) { toast.error(e?.response?.data?.message || "Lỗi tính lương") }
  }

  const handleMarkPaid = async (id) => {
    try { await staffApi.markPayrollPaid(id); toast.success("Đã đánh dấu đã trả"); fetchPayroll() }
    catch { toast.error("Lỗi") }
  }

  // ─── Shifts ──────────────────────────────────────────────────
  const fetchShifts = useCallback(async () => {
    setShiftsLoading(true)
    try { setShifts(await staffApi.getShifts()) }
    catch { toast.error("Không tải được ca làm việc") }
    finally { setShiftsLoading(false) }
  }, [])

  useEffect(() => { if (tab === "shifts") fetchShifts() }, [tab, fetchShifts])

  const handleCreateShift = async () => {
    try { await staffApi.createShift(shiftForm); toast.success("Đã tạo ca"); fetchShifts(); setShiftForm({ name: "", startTime: "08:00", endTime: "17:00", description: "" }) }
    catch (e) { toast.error(e?.response?.data?.message || "Lỗi") }
  }

  const handleAssignShift = async () => {
    try {
      await staffApi.assignShift({ ...assignForm, employeeId: Number(assignForm.employeeId), shiftId: Number(assignForm.shiftId) })
      toast.success("Đã phân ca!")
      setAssignForm({ employeeId: "", shiftId: "", date: "" })
    } catch (e) { toast.error(e?.response?.data?.message || "Lỗi phân ca") }
  }

  // ─── Helpers ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa nhân viên?")) return
    try { await staffApi.deleteEmployee(id); toast.success("Đã xóa"); fetchData() } catch { toast.error("Lỗi") }
  }

  const handleAddDept = async () => {
    const name = prompt("Tên phòng ban:"); if (!name) return
    try { await staffApi.createDepartment(name, ""); toast.success("Đã tạo phòng ban"); fetchData() } catch { toast.error("Lỗi") }
  }

  const enriched = employees.map(e => ({ ...e, _salaryFmt: formatCurrency(e.baseSalary) }))
  const getInitials = (n) => n ? n.split(" ").map(x => x[0]).join("").slice(-2).toUpperCase() : "NV"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Nhân viên & HR</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { exportToExcel(enriched, EMP_COLUMNS, "nhan_vien"); toast.success("Xuất Excel!") }}><Download className="h-4 w-4 mr-1" />Excel</Button>
          <Button variant="outline" size="sm" onClick={() => { exportToPdf(enriched, EMP_COLUMNS, "nhan_vien", { title: "Danh sách Nhân viên" }); toast.success("Xuất PDF!") }}><FileText className="h-4 w-4 mr-1" />PDF</Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={() => { setEditEmployee(null); setShowForm(true) }}><Plus className="h-4 w-4 mr-2" />Thêm nhân viên</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="employees"><Search className="h-3.5 w-3.5 mr-1" />Nhân viên ({totalElements})</TabsTrigger>
          <TabsTrigger value="departments"><Building2 className="h-3.5 w-3.5 mr-1" />Phòng ban ({departments.length})</TabsTrigger>
          <TabsTrigger value="attendance"><Clock className="h-3.5 w-3.5 mr-1" />Chấm công</TabsTrigger>
          <TabsTrigger value="leave"><CalendarOff className="h-3.5 w-3.5 mr-1" />Nghỉ phép</TabsTrigger>
          <TabsTrigger value="payroll"><DollarSign className="h-3.5 w-3.5 mr-1" />Lương</TabsTrigger>
          <TabsTrigger value="shifts"><CalendarClock className="h-3.5 w-3.5 mr-1" />Ca làm việc</TabsTrigger>
        </TabsList>

        {/* ── EMPLOYEES TAB ─────────────────────────────────── */}
        <TabsContent value="employees" className="mt-4 space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm nhân viên..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></div>
          <Card><CardContent className="p-0">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
              <table className="w-full"><thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Nhân viên</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">SĐT</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Phòng ban</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">Lương cơ bản</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
              </tr></thead><tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(e.fullName)}</AvatarFallback></Avatar><span className="text-sm font-medium">{e.fullName}</span></div></td>
                    <td className="p-3 text-sm text-muted-foreground">{e.email || "—"}</td>
                    <td className="p-3 text-sm font-mono">{e.phone || "—"}</td>
                    <td className="p-3"><Badge variant="secondary">{e.departmentName || "—"}</Badge></td>
                    <td className="p-3 text-sm text-right font-medium">{formatCurrency(e.baseSalary)}</td>
                    <td className="p-3"><div className="flex justify-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditEmployee(e); setShowForm(true) }}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                  </tr>
                ))}
                {employees.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Không tìm thấy nhân viên</td></tr>}
              </tbody></table>
            )}
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0) }} label="nhân viên" />
          </CardContent></Card>
        </TabsContent>

        {/* ── DEPARTMENTS TAB ───────────────────────────────── */}
        <TabsContent value="departments" className="mt-4 space-y-4">
          <div className="flex justify-end"><Button variant="outline" onClick={handleAddDept}><Plus className="h-4 w-4 mr-1" />Thêm phòng ban</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map((d) => (
              <Card key={d.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />{d.name}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{d.description || "Không có mô tả"}</p></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── ATTENDANCE TAB ────────────────────────────────── */}
        <TabsContent value="attendance" className="mt-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCheckIn}><LogIn className="h-4 w-4 mr-2" />Check-in</Button>
            <Button variant="outline" onClick={handleCheckOut}><LogOut className="h-4 w-4 mr-2" />Check-out</Button>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Xem lịch sử chấm công</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Mã nhân viên (ID)" value={attEmpId} onChange={e => setAttEmpId(e.target.value)} className="max-w-xs" />
                <Button onClick={fetchAttendance} disabled={attLoading}>{attLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tìm kiếm"}</Button>
              </div>
              {attLogs.length > 0 && (
                <table className="w-full mt-2"><thead><tr className="border-b bg-muted/50">
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Mã NV</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Giờ vào</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Giờ ra</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tổng giờ</th>
                </tr></thead><tbody>
                  {attLogs.map((a, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-sm font-mono">{a.employeeId}</td>
                      <td className="p-3 text-sm">{fmtDate(a.checkInTime)}</td>
                      <td className="p-3 text-sm">{a.checkOutTime ? fmtDate(a.checkOutTime) : <Badge variant="secondary">Chưa ra</Badge>}</td>
                      <td className="p-3 text-sm text-right font-medium">{a.totalHours != null ? `${a.totalHours.toFixed(1)}h` : "—"}</td>
                    </tr>
                  ))}
                </tbody></table>
              )}
              {attLogs.length === 0 && attEmpId && !attLoading && <p className="text-center text-muted-foreground py-6">Không có dữ liệu chấm công</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LEAVE TAB ────────────────────────────────────── */}
        <TabsContent value="leave" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Đăng ký nghỉ phép</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input placeholder="Mã NV (ID)" value={leaveForm.employeeId} onChange={e => setLeaveForm(f => ({ ...f, employeeId: e.target.value }))} />
                <Input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} />
                <Input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} />
                <Input placeholder="Lý do nghỉ phép" value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <Button onClick={handleSubmitLeave} className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white"><Plus className="h-4 w-4 mr-2" />Gửi yêu cầu</Button>
            </CardContent>
          </Card>

          <Card><CardContent className="p-0">
            {leaveLoading ? <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <table className="w-full"><thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Mã NV</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Từ ngày</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Đến ngày</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Lý do</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
              </tr></thead><tbody>
                {leaveList.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-sm font-mono">{l.employeeId}</td>
                    <td className="p-3 text-sm">{fmtDateShort(l.startDate)}</td>
                    <td className="p-3 text-sm">{fmtDateShort(l.endDate)}</td>
                    <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">{l.reason || "—"}</td>
                    <td className="p-3 text-center"><Badge variant={STATUS_COLORS[l.status] || "secondary"}>{l.status}</Badge></td>
                    <td className="p-3">
                      {l.status === "PENDING" && (
                        <div className="flex justify-center gap-1">
                          <Button size="icon" className="h-7 w-7 bg-emerald-600 hover:bg-emerald-700" onClick={async () => { try { await staffApi.approveLeave(l.id); toast.success("Đã duyệt"); fetchLeave() } catch { toast.error("Lỗi") } }}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="destructive" className="h-7 w-7" onClick={async () => { try { await staffApi.rejectLeave(l.id); toast.success("Đã từ chối"); fetchLeave() } catch { toast.error("Lỗi") } }}><XCircle className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {leaveList.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Chưa có yêu cầu nghỉ phép</td></tr>}
              </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ── PAYROLL TAB ──────────────────────────────────── */}
        <TabsContent value="payroll" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tính lương nhân viên</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Input placeholder="Mã NV (ID)" value={payrollForm.employeeId} onChange={e => setPayrollForm(f => ({ ...f, employeeId: e.target.value }))} />
                <Input type="number" placeholder="Tháng" min={1} max={12} value={payrollForm.month} onChange={e => setPayrollForm(f => ({ ...f, month: e.target.value }))} />
                <Input type="number" placeholder="Năm" value={payrollForm.year} onChange={e => setPayrollForm(f => ({ ...f, year: e.target.value }))} />
                <Input type="number" placeholder="Lương/giờ (VNĐ)" value={payrollForm.hourlyRate} onChange={e => setPayrollForm(f => ({ ...f, hourlyRate: e.target.value }))} />
                <Input type="number" placeholder="Thưởng (VNĐ)" value={payrollForm.bonusAmount} onChange={e => setPayrollForm(f => ({ ...f, bonusAmount: e.target.value }))} />
              </div>
              <Button onClick={handleGeneratePayroll} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white"><DollarSign className="h-4 w-4 mr-2" />Tính lương</Button>
            </CardContent>
          </Card>

          <Card><CardContent className="p-0">
            {payrollLoading ? <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <table className="w-full"><thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Mã NV</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Tháng/Năm</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">Giờ làm</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">Lương cơ bản</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">Thưởng</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tổng</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
              </tr></thead><tbody>
                {payrollList.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-sm font-mono">{p.employeeId}</td>
                    <td className="p-3 text-sm text-center">{p.month}/{p.year}</td>
                    <td className="p-3 text-sm text-right">{p.totalHoursWorked?.toFixed(1)}h</td>
                    <td className="p-3 text-sm text-right">{formatCurrency(p.baseSalary)}</td>
                    <td className="p-3 text-sm text-right">{formatCurrency(p.bonusAmount)}</td>
                    <td className="p-3 text-sm text-right font-bold text-emerald-600">{formatCurrency(p.totalAmount)}</td>
                    <td className="p-3 text-center"><Badge variant={p.status === "PAID" ? "success" : "secondary"}>{p.status === "PAID" ? "Đã trả" : "Chưa trả"}</Badge></td>
                    <td className="p-3 text-center">
                      {p.status !== "PAID" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 border-emerald-600" onClick={() => handleMarkPaid(p.id)}>Đã trả</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {payrollList.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Chưa có dữ liệu lương</td></tr>}
              </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ── SHIFTS TAB ────────────────────────────────────── */}
        <TabsContent value="shifts" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Create Shift */}
            <Card>
              <CardHeader><CardTitle className="text-base">Tạo ca làm việc</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Tên ca (VD: Ca sáng)" value={shiftForm.name} onChange={e => setShiftForm(f => ({ ...f, name: e.target.value }))} />
                <div className="flex gap-2">
                  <div className="flex-1"><p className="text-xs text-muted-foreground mb-1">Bắt đầu</p><Input type="time" value={shiftForm.startTime} onChange={e => setShiftForm(f => ({ ...f, startTime: e.target.value }))} /></div>
                  <div className="flex-1"><p className="text-xs text-muted-foreground mb-1">Kết thúc</p><Input type="time" value={shiftForm.endTime} onChange={e => setShiftForm(f => ({ ...f, endTime: e.target.value }))} /></div>
                </div>
                <Input placeholder="Mô tả (tuỳ chọn)" value={shiftForm.description} onChange={e => setShiftForm(f => ({ ...f, description: e.target.value }))} />
                <Button onClick={handleCreateShift} className="w-full bg-gradient-to-r from-violet-600 to-purple-500 text-white"><Plus className="h-4 w-4 mr-2" />Tạo ca</Button>
              </CardContent>
            </Card>

            {/* Assign Shift */}
            <Card>
              <CardHeader><CardTitle className="text-base">Phân ca nhân viên</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Mã nhân viên (ID)" value={assignForm.employeeId} onChange={e => setAssignForm(f => ({ ...f, employeeId: e.target.value }))} />
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={assignForm.shiftId} onChange={e => setAssignForm(f => ({ ...f, shiftId: e.target.value }))}>
                  <option value="">— Chọn ca —</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime} – {s.endTime})</option>)}
                </select>
                <Input type="date" value={assignForm.date} onChange={e => setAssignForm(f => ({ ...f, date: e.target.value }))} />
                <Button onClick={handleAssignShift} className="w-full" variant="outline"><CalendarClock className="h-4 w-4 mr-2" />Phân ca</Button>
              </CardContent>
            </Card>
          </div>

          {/* Shift list */}
          {shiftsLoading ? <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {shifts.map(s => (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-violet-500" />{s.name}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{s.startTime} – {s.endTime}</p>
                    {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                  </CardContent>
                </Card>
              ))}
              {shifts.length === 0 && <p className="text-muted-foreground text-sm col-span-3 text-center py-6">Chưa có ca làm việc nào</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <StaffFormDialog open={showForm} onOpenChange={setShowForm} employee={editEmployee} departments={departments} onSuccess={fetchData} />
    </div>
  )
}
