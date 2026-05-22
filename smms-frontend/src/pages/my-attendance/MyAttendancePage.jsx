import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import * as staffApi from "@/api/staffApi"
import {
  Clock, LogIn, LogOut, Loader2, CalendarClock, CalendarOff, History, User, AlertCircle, Plus, Send, DollarSign, Wallet, Banknote
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { formatCurrency } from "@/lib/utils"

const fmtDate = (d) => d ? new Date(d).toLocaleString("vi-VN") : "—"
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—"

export default function MyAttendancePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState("checkin")

  // ── Employee info ──
  const [employee, setEmployee] = useState(null)
  const [empLoading, setEmpLoading] = useState(true)
  const [empError, setEmpError] = useState(null)

  // ── Attendance ──
  const [checking, setChecking] = useState(false)
  const [attLogs, setAttLogs] = useState([])
  const [attLoading, setAttLoading] = useState(false)
  const [activeCheckIn, setActiveCheckIn] = useState(null)
  const [attFetched, setAttFetched] = useState(false)

  // ── Shift Schedule ──
  const [schedules, setSchedules] = useState([])
  const [schedLoading, setSchedLoading] = useState(false)

  // ── Leave Request ──
  const [leaveList, setLeaveList] = useState([])
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [leaveSubmitting, setLeaveSubmitting] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" })

  // ── Payroll / Salary ──
  const [payrollList, setPayrollList] = useState([])
  const [payrollLoading, setPayrollLoading] = useState(false)

  // ─── Load employee info from auth ─────────────────────────────
  useEffect(() => {
    const loadEmployee = async () => {
      setEmpLoading(true)
      setEmpError(null)
      try {
        const emp = await staffApi.getEmployeeByAccountId(user.id)
        setEmployee(emp)
      } catch (e) {
        console.error("Failed to load employee info:", e)
        setEmpError("Không tìm thấy thông tin nhân viên. Vui lòng liên hệ Admin.")
      } finally {
        setEmpLoading(false)
      }
    }
    if (user?.id) loadEmployee()
  }, [user?.id])

  // ─── Load attendance logs ─────────────────────────────────────
  const fetchAttendance = useCallback(async () => {
    if (!employee?.id) return
    setAttLoading(true)
    try {
      const res = await staffApi.getAttendanceLogs(employee.id)
      const logs = res.content || []
      setAttLogs(logs)
      // Find active check-in (no checkout time)
      const active = logs.find(l => !l.checkOutTime)
      setActiveCheckIn(active || null)
    } catch (e) {
      console.error("Failed to load attendance:", e)
      // Even on failure, allow user to try check-in
      setActiveCheckIn(null)
      toast.error("Không tải được lịch sử chấm công")
    } finally {
      setAttLoading(false)
      setAttFetched(true)
    }
  }, [employee?.id])

  useEffect(() => {
    if (employee?.id) fetchAttendance()
  }, [employee?.id, fetchAttendance])

  // ─── Load shift schedule ──────────────────────────────────────
  const fetchSchedule = useCallback(async () => {
    if (!employee?.id) return
    setSchedLoading(true)
    try {
      const res = await staffApi.getShiftSchedule(employee.id)
      setSchedules(res.content || [])
    } catch {
      toast.error("Không tải được lịch ca")
    } finally {
      setSchedLoading(false)
    }
  }, [employee?.id])

  useEffect(() => {
    if (tab === "schedule" && employee?.id) fetchSchedule()
  }, [tab, employee?.id, fetchSchedule])

  // ─── Load leave requests ──────────────────────────────────────
  const fetchLeave = useCallback(async () => {
    if (!employee?.id) return
    setLeaveLoading(true)
    try {
      const res = await staffApi.getMyLeaveRequests(employee.id)
      setLeaveList(res.content || [])
    } catch {
      toast.error("Không tải được danh sách đơn từ")
    } finally {
      setLeaveLoading(false)
    }
  }, [employee?.id])

  useEffect(() => {
    if (tab === "leave" && employee?.id) fetchLeave()
  }, [tab, employee?.id, fetchLeave])

  // ─── Load payroll / salary history ────────────────────────────
  const fetchPayroll = useCallback(async () => {
    if (!employee?.id) return
    setPayrollLoading(true)
    try {
      const res = await staffApi.getMyPayroll(employee.id)
      setPayrollList(res.content || [])
    } catch {
      toast.error("Không tải được lịch sử lương")
    } finally {
      setPayrollLoading(false)
    }
  }, [employee?.id])

  useEffect(() => {
    if (tab === "salary" && employee?.id) fetchPayroll()
  }, [tab, employee?.id, fetchPayroll])

  // ─── Submit leave request ─────────────────────────────────────
  const handleSubmitLeave = async () => {
    if (!employee?.id) { toast.error("Không tìm thấy thông tin nhân viên"); return }
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc")
      return
    }
    if (leaveForm.startDate > leaveForm.endDate) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc")
      return
    }
    setLeaveSubmitting(true)
    try {
      await staffApi.submitLeaveRequest({
        employeeId: employee.id,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
      })
      toast.success("Gửi đơn thành công! 📄")
      setLeaveForm({ startDate: "", endDate: "", reason: "" })
      fetchLeave()
    } catch (e) {
      const msg = e?.response?.data?.message || "Lỗi gửi đơn. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setLeaveSubmitting(false)
    }
  }

  const LEAVE_STATUS = {
    PENDING: { label: "Chờ duyệt", variant: "secondary", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    APPROVED: { label: "Đã duyệt", variant: "success", className: "" },
    REJECTED: { label: "Từ chối", variant: "destructive", className: "" },
  }

  // ─── Check-in / Check-out ─────────────────────────────────────
  const handleCheckIn = async () => {
    if (!employee?.id) {
      toast.error("Không tìm thấy thông tin nhân viên")
      return
    }
    setChecking(true)
    try {
      await staffApi.checkIn({ employeeId: employee.id })
      toast.success("Check-in thành công! 🎉")
      await fetchAttendance()
    } catch (e) {
      console.error("Check-in failed:", e)
      const msg = e?.response?.data?.message || "Lỗi check-in. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setChecking(false)
    }
  }

  const handleCheckOut = async () => {
    if (!employee?.id) {
      toast.error("Không tìm thấy thông tin nhân viên")
      return
    }
    setChecking(true)
    try {
      await staffApi.checkOut(employee.id)
      toast.success("Check-out thành công! 👋")
      await fetchAttendance()
    } catch (e) {
      console.error("Check-out failed:", e)
      const msg = e?.response?.data?.message || "Lỗi check-out. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setChecking(false)
    }
  }

  // Buttons should be enabled even if attendance data hasn't loaded yet
  const isCheckInDisabled = checking || !!activeCheckIn
  const isCheckOutDisabled = checking || !activeCheckIn

  // ─── Loading / Error states ───────────────────────────────────
  if (empLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải thông tin nhân viên...</span>
      </div>
    )
  }

  if (empError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive text-lg font-medium">{empError}</p>
      </div>
    )
  }

  const getInitials = (n) => n ? n.split(" ").map(x => x[0]).join("").slice(-2).toUpperCase() : "NV"
  const now = new Date()
  const greeting = now.getHours() < 12 ? "Chào buổi sáng" : now.getHours() < 18 ? "Chào buổi chiều" : "Chào buổi tối"

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-primary/30">
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
            {getInitials(employee?.fullName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {employee?.fullName}!</h1>
          <p className="text-muted-foreground text-sm">
            {employee?.departmentName || "Chưa có phòng ban"} • Mã NV: {employee?.id}
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="checkin"><Clock className="h-3.5 w-3.5 mr-1" />Chấm công</TabsTrigger>
          <TabsTrigger value="history"><History className="h-3.5 w-3.5 mr-1" />Lịch sử</TabsTrigger>
          <TabsTrigger value="schedule"><CalendarClock className="h-3.5 w-3.5 mr-1" />Lịch ca</TabsTrigger>
          <TabsTrigger value="leave"><CalendarOff className="h-3.5 w-3.5 mr-1" />Đơn từ</TabsTrigger>
          <TabsTrigger value="salary"><DollarSign className="h-3.5 w-3.5 mr-1" />Lương</TabsTrigger>
        </TabsList>

        {/* ── CHECK-IN TAB ── */}
        <TabsContent value="checkin" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <LogIn className="h-4 w-4 text-emerald-600" />
                  </div>
                  Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCheckIn ? (
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Đang trong ca
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Đã check-in lúc: <span className="font-medium text-foreground">{fmtDate(activeCheckIn.checkInTime)}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Bạn chưa check-in hôm nay. Nhấn nút bên dưới để bắt đầu ca làm.</p>
                )}
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                  onClick={handleCheckIn}
                  disabled={isCheckInDisabled}
                  size="lg"
                >
                  {checking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                  {activeCheckIn ? "Đã check-in" : "Check-in ngay"}
                </Button>
              </CardContent>
            </Card>

            {/* Check-out Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-orange-600" />
                  </div>
                  Check-out
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCheckIn ? (
                  <p className="text-sm text-muted-foreground">Kết thúc ca làm. Hệ thống sẽ tự động tính tổng giờ làm.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có ca làm đang mở. Vui lòng check-in trước.</p>
                )}
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleCheckOut}
                  disabled={isCheckOutDisabled}
                  size="lg"
                >
                  {checking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogOut className="h-5 w-5 mr-2" />}
                  Check-out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Today's summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hôm nay ({fmtDateShort(new Date())})</CardTitle>
            </CardHeader>
            <CardContent>
              {attLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <>
                  {attLogs.filter(l => {
                    const logDate = new Date(l.checkInTime).toDateString()
                    return logDate === new Date().toDateString()
                  }).length > 0 ? (
                    <table className="w-full">
                      <thead><tr className="border-b bg-muted/50">
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground">Giờ vào</th>
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground">Giờ ra</th>
                        <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tổng giờ</th>
                        <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
                      </tr></thead>
                      <tbody>
                        {attLogs.filter(l => {
                          const logDate = new Date(l.checkInTime).toDateString()
                          return logDate === new Date().toDateString()
                        }).map((a, i) => (
                          <tr key={i} className="border-b hover:bg-muted/30">
                            <td className="p-3 text-sm">{fmtDate(a.checkInTime)}</td>
                            <td className="p-3 text-sm">{a.checkOutTime ? fmtDate(a.checkOutTime) : "—"}</td>
                            <td className="p-3 text-sm text-right font-medium">
                              {a.totalHours != null ? `${a.totalHours.toFixed(1)}h` : "—"}
                            </td>
                            <td className="p-3 text-center">
                              {a.checkOutTime
                                ? <Badge variant="success">Hoàn thành</Badge>
                                : <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Đang làm</Badge>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">Chưa có dữ liệu chấm công hôm nay</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HISTORY TAB ── */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />Lịch sử chấm công
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {attLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : attLogs.length > 0 ? (
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Ngày</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Giờ vào</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Giờ ra</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tổng giờ</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
                  </tr></thead>
                  <tbody>
                    {attLogs.map((a, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-sm font-medium">{fmtDateShort(a.checkInTime)}</td>
                        <td className="p-3 text-sm">{fmtDate(a.checkInTime)}</td>
                        <td className="p-3 text-sm">{a.checkOutTime ? fmtDate(a.checkOutTime) : "—"}</td>
                        <td className="p-3 text-sm text-right font-medium">
                          {a.totalHours != null ? `${a.totalHours.toFixed(1)}h` : "—"}
                        </td>
                        <td className="p-3 text-center">
                          {a.checkOutTime
                            ? <Badge variant="success">Hoàn thành</Badge>
                            : <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Đang làm</Badge>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-muted-foreground py-10">Chưa có dữ liệu chấm công</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SCHEDULE TAB ── */}
        <TabsContent value="schedule" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-violet-500" />Lịch ca làm việc
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {schedLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : schedules.length > 0 ? (
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Ngày làm</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Ca</th>
                  </tr></thead>
                  <tbody>
                    {schedules.map((s, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-sm font-medium">{fmtDateShort(s.workDate)}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                            {s.shiftName}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-muted-foreground py-10">Chưa có lịch ca</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LEAVE TAB ── */}
        <TabsContent value="leave" className="mt-4 space-y-4">
          {/* Submit leave form */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                Gửi đơn nghỉ phép
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ngày bắt đầu</p>
                  <Input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ngày kết thúc</p>
                  <Input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Lý do</p>
                  <Input
                    placeholder="Nhập lý do nghỉ phép..."
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                onClick={handleSubmitLeave}
                disabled={leaveSubmitting}
                size="lg"
              >
                {leaveSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                Gửi đơn
              </Button>
            </CardContent>
          </Card>

          {/* Leave list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarOff className="h-4 w-4 text-blue-500" />Danh sách đơn từ của tôi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {leaveLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : leaveList.length > 0 ? (
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Từ ngày</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Đến ngày</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Lý do</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
                  </tr></thead>
                  <tbody>
                    {leaveList.map((l) => {
                      const st = LEAVE_STATUS[l.status] || LEAVE_STATUS.PENDING
                      return (
                        <tr key={l.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 text-sm font-medium">{fmtDateShort(l.startDate)}</td>
                          <td className="p-3 text-sm font-medium">{fmtDateShort(l.endDate)}</td>
                          <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">{l.reason || "—"}</td>
                          <td className="p-3 text-center">
                            <Badge variant={st.variant} className={st.className}>{st.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-muted-foreground py-10">Chưa có đơn từ nào</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SALARY TAB ── */}
        <TabsContent value="salary" className="mt-4 space-y-4">
          {/* Base Salary Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lương cơ bản</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(employee?.baseSalary || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phòng ban</p>
                    <p className="text-lg font-semibold">{employee?.departmentName || "Chưa phân phòng"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tài khoản ngân hàng</p>
                    <p className="text-lg font-semibold">{employee?.bankAccountNumber || "Chưa cập nhật"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payroll History Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />Lịch sử nhận lương
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {payrollLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : payrollList.length > 0 ? (
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Kỳ lương</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Giờ làm</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Lương chuẩn</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Thưởng</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Khấu trừ</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Thực nhận</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
                  </tr></thead>
                  <tbody>
                    {payrollList.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-sm font-medium">Tháng {p.month}/{p.year}</td>
                        <td className="p-3 text-sm text-right">{p.totalWorkHours != null ? `${p.totalWorkHours.toFixed(1)}h` : "—"}</td>
                        <td className="p-3 text-sm text-right">{formatCurrency(p.standardSalary || 0)}</td>
                        <td className="p-3 text-sm text-right text-emerald-600">{p.bonus > 0 ? `+${formatCurrency(p.bonus)}` : "—"}</td>
                        <td className="p-3 text-sm text-right text-red-500">{p.deduction > 0 ? `-${formatCurrency(p.deduction)}` : "—"}</td>
                        <td className="p-3 text-sm text-right font-bold">{formatCurrency(p.finalSalary || 0)}</td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={p.status === "PAID" ? "success" : "secondary"}
                            className={p.status === "PAID" ? "" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}
                          >
                            {p.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-muted-foreground py-10">Chưa có dữ liệu lương</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
