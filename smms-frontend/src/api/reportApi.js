import api, { unwrap, unwrapPage } from "./client"

// POST /api/v1/reports/generate → ReportResponse
export async function generateReport(data) {
  const resp = await api.post("/api/v1/reports/generate", data)
  return unwrap(resp)
}

// GET /api/v1/reports?page&size → Page<ReportResponse>
export async function getReports(params = {}) {
  const resp = await api.get("/api/v1/reports", { params })
  return unwrapPage(resp)
}

// GET /api/v1/reports/:id → ReportResponse
export async function getReportById(id) {
  const resp = await api.get(`/api/v1/reports/${id}`)
  return unwrap(resp)
}

// GET /api/v1/reports/requester/:accountId?page&size → Page<ReportResponse>
export async function getReportsByRequester(accountId, params = {}) {
  const resp = await api.get(`/api/v1/reports/requester/${accountId}`, { params })
  return unwrapPage(resp)
}

// GET /api/v1/reports/:id/download → CSV file (blob)
// Supported types: SALES, INVENTORY
export async function downloadReport(id) {
  const resp = await api.get(`/api/v1/reports/${id}/download`, { responseType: "blob" })
  return resp.data
}
