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
  const resp = await api.post("/api/v1/staff/attendance/check-in", data)
  return unwrap(resp)
}

export async function checkOut(employeeId) {
  const resp = await api.post(`/api/v1/staff/attendance/check-out/${employeeId}`)
  return unwrap(resp)
}

export async function getAttendanceLogs(employeeId, params = {}) {
  const resp = await api.get("/api/v1/staff/attendance", {
    params: { employeeId, ...params },
  })
  return unwrapPage(resp)
}

// === Leave (Nghỉ phép) ===

export async function submitLeaveRequest(data) {
  // Ensure date strings include time portion for ISO parse
  const payload = {
    ...data,
    startDate: data.startDate && !data.startDate.includes("T") ? data.startDate + "T00:00:00" : data.startDate,
    endDate: data.endDate && !data.endDate.includes("T") ? data.endDate + "T23:59:59" : data.endDate,
  }
  const resp = await api.post("/api/v1/staff/leave", payload)
  return unwrap(resp)
}

export async function approveLeave(id) {
  const resp = await api.put(`/api/v1/staff/leave/${id}/approve`)
  return unwrap(resp)
}

export async function rejectLeave(id) {
  const resp = await api.put(`/api/v1/staff/leave/${id}/reject`)
  return unwrap(resp)
}

export async function getLeaveRequests(employeeId) {
  const resp = await api.get("/api/v1/staff/leave", {
    params: { employeeId },
  })
  return unwrapPage(resp)
}

export async function getMyLeaveRequests(employeeId) {
  const resp = await api.get("/api/v1/staff/leave/my", {
    params: { employeeId },
  })
  return unwrapPage(resp)
}

export async function getAllLeaveRequests(params = {}) {
  const resp = await api.get("/api/v1/staff/leave", { params })
  return unwrapPage(resp)
}

// === Payroll (Bảng lương) ===

export async function generatePayroll(data) {
  const resp = await api.post("/api/v1/staff/payroll/generate", data)
  return unwrap(resp)
}

export async function markPayrollPaid(id) {
  const resp = await api.put(`/api/v1/staff/payroll/${id}/pay`)
  return unwrap(resp)
}

export async function getPayrollByEmployee(employeeId, params = {}) {
  const resp = await api.get("/api/v1/staff/payroll", {
    params: { employeeId, ...params },
  })
  return unwrapPage(resp)
}

export async function getAllPayroll(params = {}) {
  const resp = await api.get("/api/v1/staff/payroll", { params })
  return unwrapPage(resp)
}

export async function getMyPayroll(employeeId, params = {}) {
  const resp = await api.get("/api/v1/staff/payroll/my", {
    params: { employeeId, ...params },
  })
  return unwrapPage(resp)
}

// === Shifts (Ca làm việc) ===

export async function createShift(data) {
  const resp = await api.post("/api/v1/staff/shifts", data)
  return unwrap(resp)
}

export async function getShifts() {
  const resp = await api.get("/api/v1/staff/shifts")
  return unwrap(resp) || []
}

export async function assignShift(data) {
  const resp = await api.post("/api/v1/staff/shifts/assign", data)
  return unwrap(resp)
}

export async function getShiftSchedule(employeeId, params = {}) {
  const resp = await api.get("/api/v1/staff/shifts/schedules", {
    params: { employeeId, ...params },
  })
  return unwrapPage(resp)
}

export async function getAllShiftSchedules(params = {}) {
  const resp = await api.get("/api/v1/staff/shifts/schedules", { params })
  return unwrapPage(resp)
}
