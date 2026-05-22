import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as reportApi from "@/api/reportApi"
import * as orderApi from "@/api/orderApi"
import * as productApi from "@/api/productApi"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts"
import { Download, FileText, Loader2, BarChart3, TrendingUp, Calendar, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { formatCurrency, safeNum } from "@/lib/utils"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const REPORT_TYPES = [
  { value: "SALES", label: "Báo cáo Doanh thu (Sales)", icon: "📊" },
  { value: "INVENTORY", label: "Báo cáo Tồn kho (Inventory)", icon: "📦" },
]

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [reportType, setReportType] = useState("SALES")
  const [periodFrom, setPeriodFrom] = useState("")
  const [periodTo, setPeriodTo] = useState("")
  const [downloading, setDownloading] = useState(null)

  const fetchReports = async () => {
    try {
      const result = await reportApi.getReports({ page: 0, size: 20 })
      setReports(result?.content || [])
    } catch { /* ignore */ }
  }

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const [reportsRes, statsRes, productsRes, categoriesRes] = await Promise.allSettled([
          reportApi.getReports({ page: 0, size: 20 }),
          orderApi.getOrderStatistics(),
          productApi.getProducts({ page: 0, size: 1000 }),
          productApi.getRootCategories(),
        ])

        if (reportsRes.status === "fulfilled") setReports(reportsRes.value?.content || [])

        // Build monthly & daily revenue from backend statistics
        const stats = statsRes.status === "fulfilled" ? statsRes.value : null
        if (stats?.monthlySummary?.length) {
          setMonthlyData(stats.monthlySummary.map(m => ({
            month: m.month,
            revenue: safeNum(m.revenue),
            orders: safeNum(m.orders),
          })))
        }
        if (stats?.dailyRevenue?.length) {
          setDailyData(stats.dailyRevenue.map(d => ({
            day: d.name,
            revenue: safeNum(d.revenue),
          })))
        }

        // Category distribution
        if (productsRes.status === "fulfilled" && categoriesRes.status === "fulfilled") {
          const products = productsRes.value?.content || []
          const cats = categoriesRes.value || []
          const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]))
          const catCount = {}
          products.forEach(p => {
            (p.categoryIds || []).forEach(cid => {
              const name = catMap[cid] || "Khác"
              catCount[name] = (catCount[name] || 0) + 1
            })
          })
          setCategoryData(Object.entries(catCount).map(([name, value]) => ({ name, value })))

          // Top products by price (best we can do without sales count per product)
          const sorted = [...products].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 5)
          setTopProducts(sorted.map(p => ({ name: p.name, revenue: p.price || 0 })))
        }
      } catch { setReports([]) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const payload = {
        type: reportType,
        title: REPORT_TYPES.find(r => r.value === reportType)?.label || reportType,
        requestedBy: user?.id,
        periodFrom: periodFrom || undefined,
        periodTo: periodTo || undefined,
      }
      const result = await reportApi.generateReport(payload)
      toast.success(`Đã tạo báo cáo! Trạng thái: ${result.status}`)
      await fetchReports()
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi tạo báo cáo")
    } finally { setGenerating(false) }
  }

  const handleDownload = async (report) => {
    if (report.status !== "COMPLETED") {
      toast.warning("Báo cáo chưa hoàn thành, không thể tải")
      return
    }
    setDownloading(report.id)
    try {
      const blob = await reportApi.downloadReport(report.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report_${report.id}_${report.type}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Đã tải file CSV!")
    } catch {
      toast.error("Không thể tải báo cáo")
    } finally { setDownloading(null) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
          <p className="text-sm text-muted-foreground">Phân tích doanh thu, sản phẩm và xuất báo cáo CSV</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { exportToExcel(monthlyData, [{ key: "month", label: "Tháng" }, { key: "revenue", label: "Doanh thu" }, { key: "orders", label: "Đơn hàng" }], "bao_cao_doanh_thu"); toast.success("Xuất Excel!") }}><Download className="h-4 w-4 mr-1" />Excel</Button>
          <Button variant="outline" size="sm" onClick={() => { exportToPdf(monthlyData, [{ key: "month", label: "Tháng" }, { key: "revenue", label: "Doanh thu", format: v => formatCurrency(v) + " ₫" }, { key: "orders", label: "Đơn hàng" }], "bao_cao_doanh_thu", { title: "Báo cáo Doanh thu 2026" }); toast.success("Xuất PDF!") }}><FileText className="h-4 w-4 mr-1" />PDF</Button>
        </div>
      </div>

      {/* Generate Report Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-500" />Tạo báo cáo CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Loại báo cáo</p>
              <select className="border rounded-md px-3 py-2 text-sm bg-background h-9" value={reportType} onChange={e => setReportType(e.target.value)}>
                {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Từ ngày</p>
              <Input type="datetime-local" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Đến ngày</p>
              <Input type="datetime-local" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="h-9 text-sm" />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white h-9">
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              Tạo báo cáo
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={fetchReports} title="Làm mới danh sách"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" />Doanh thu theo tháng (2026)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={v => `${((Number(v) || 0) / 1000000).toFixed(0)}tr`} />
                <Tooltip formatter={(v, name) => [name === "revenue" ? formatCurrency(v) : v, name === "revenue" ? "Doanh thu" : "Đơn hàng"]} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Tỉ lệ danh mục</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((Number(percent) || 0) * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" />Doanh thu theo ngày (7 ngày gần nhất)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyData}>
                <defs><linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={v => `${((Number(v) || 0) / 1000000).toFixed(1)}tr`} />
                <Tooltip formatter={v => [formatCurrency(v), "Doanh thu"]} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#dailyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Top sản phẩm (giá cao nhất)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tickFormatter={v => formatCurrency(v)} />
                <YAxis type="category" dataKey="name" className="text-xs" width={120} />
                <Tooltip formatter={v => [formatCurrency(v), "Giá bán"]} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Lịch sử báo cáo</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full"><thead><tr className="border-b bg-muted/50">
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Mã BC</th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Loại</th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Tiêu đề</th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Kỳ báo cáo</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
            <th className="p-3 text-left text-xs font-medium text-muted-foreground">Ngày tạo</th>
            <th className="p-3 text-center text-xs font-medium text-muted-foreground">Tải xuống</th>
          </tr></thead><tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3 text-sm font-mono text-muted-foreground">#{r.id}</td>
                <td className="p-3 text-sm font-medium">{r.type}</td>
                <td className="p-3 text-sm">{r.title || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {r.periodFrom ? new Date(r.periodFrom).toLocaleDateString("vi-VN") : ""}{r.periodFrom && r.periodTo ? " – " : ""}{r.periodTo ? new Date(r.periodTo).toLocaleDateString("vi-VN") : ""}
                  {!r.periodFrom && !r.periodTo && "Toàn thời gian"}
                </td>
                <td className="p-3 text-center">
                  <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "destructive" : "secondary"}>{r.status}</Badge>
                </td>
                <td className="p-3 text-sm text-muted-foreground">{r.requestedAt ? new Date(r.requestedAt).toLocaleString("vi-VN") : ""}</td>
                <td className="p-3 text-center">
                  <Button
                    size="sm" variant="outline"
                    className={`h-7 text-xs ${r.status === "COMPLETED" ? "text-emerald-600 border-emerald-600 hover:bg-emerald-50" : "opacity-40 cursor-not-allowed"}`}
                    disabled={r.status !== "COMPLETED" || downloading === r.id}
                    onClick={() => handleDownload(r)}
                  >
                    {downloading === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                    CSV
                  </Button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Chưa có báo cáo nào. Nhấn "Tạo báo cáo" để bắt đầu.</td></tr>
            )}
          </tbody></table>
        </CardContent>
      </Card>
    </div>
  )
}
