import api, { unwrap, unwrapPage } from "./client"

// === Employees ===

export async function getEmployees(params = {}) {
  const resp = await api.get("/api/v1/staff", { params })
  return unwrapPage(resp)
}

export async function getEmployeeById(id) {
  const resp = await api.get(`/api/v1/staff/${id}`)
  return unwrap(resp)
}

export async function getEmployeeByAccountId(accountId) {
  const resp = await api.get(`/api/v1/staff/by-account/${accountId}`)
  return unwrap(resp)
}

export async function createEmployee(data) {
  const resp = await api.post("/api/v1/staff", data)
  return unwrap(resp)
}

export async function updateEmployee(id, data) {
  const resp = await api.put(`/api/v1/staff/${id}`, data)
  return unwrap(resp)
}

export async function deleteEmployee(id) {
  await api.delete(`/api/v1/staff/${id}`)
}

// === Departments ===

export async function getDepartments() {
  const resp = await api.get("/api/v1/staff/departments")
  return unwrap(resp) || []
}

export async function createDepartment(name, description) {
  const resp = await api.post("/api/v1/staff/departments", null, {
    params: { name, description },
  })
  return unwrap(resp)
}

// === Attendance (Chấm công) ===

export async function checkIn(data) {
  const resp = await api.post("/api/v1/hr/attendance/check-in", data)
  return unwrap(resp)
}

export async function checkOut(data) {
  const resp = await api.post("/api/v1/hr/attendance/check-out", data)
  return unwrap(resp)
}

export async function getAttendanceLogs(employeeId, params = {}) {
  const resp = await api.get(`/api/v1/hr/attendance/${employeeId}`, { params })
  return unwrap(resp) || []
}

// === Leave (Nghỉ phép) ===

export async function submitLeaveRequest(data) {
  const resp = await api.post("/api/v1/hr/leave", data)
  return unwrap(resp)
}

export async function approveLeave(id) {
  const resp = await api.put(`/api/v1/hr/leave/${id}/approve`)
  return unwrap(resp)
}

export async function rejectLeave(id) {
  const resp = await api.put(`/api/v1/hr/leave/${id}/reject`)
  return unwrap(resp)
}

export async function getLeaveRequests(employeeId) {
  const resp = await api.get(`/api/v1/hr/leave/${employeeId}`)
  return unwrap(resp) || []
}

export async function getAllLeaveRequests() {
  const resp = await api.get("/api/v1/hr/leave")
  return unwrap(resp) || []
}

// === Payroll (Bảng lương) ===

export async function generatePayroll(data) {
  const resp = await api.post("/api/v1/hr/payroll/generate", data)
  return unwrap(resp)
}

export async function markPayrollPaid(id) {
  const resp = await api.put(`/api/v1/hr/payroll/${id}/paid`)
  return unwrap(resp)
}

export async function getPayrollByEmployee(employeeId) {
  const resp = await api.get(`/api/v1/hr/payroll/${employeeId}`)
  return unwrap(resp) || []
}

export async function getAllPayroll() {
  const resp = await api.get("/api/v1/hr/payroll")
  return unwrap(resp) || []
}

// === Shifts (Ca làm việc) ===

export async function createShift(data) {
  const resp = await api.post("/api/v1/hr/shifts", data)
  return unwrap(resp)
}

export async function getShifts() {
  const resp = await api.get("/api/v1/hr/shifts")
  return unwrap(resp) || []
}

export async function assignShift(data) {
  const resp = await api.post("/api/v1/hr/shifts/assign", data)
  return unwrap(resp)
}

export async function getShiftSchedule(employeeId) {
  const resp = await api.get(`/api/v1/hr/shifts/schedule/${employeeId}`)
  return unwrap(resp) || []
}

export async function getAllShiftSchedules() {
  const resp = await api.get("/api/v1/hr/shifts/schedule")
  return unwrap(resp) || []
}
