import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, safeNum } from "@/lib/utils"
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Clock, CalendarClock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import * as orderApi from "@/api/orderApi"
import * as productApi from "@/api/productApi"
import * as customerApi from "@/api/customerApi"
import * as inventoryApi from "@/api/inventoryApi"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

// Helper: compute trend % between today and yesterday
function calcTrend(today, yesterday) {
  const t = safeNum(today)
  const y = safeNum(yesterday)
  if (y === 0) return t > 0 ? "+100%" : "0%"
  const pct = ((t - y) / y) * 100
  return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%"
}
function isTrendUp(today, yesterday) {
  return safeNum(today) >= safeNum(yesterday)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()
  const isManager = hasAnyRole("ADMIN", "MANAGER")
  const [kpi, setKpi] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 })
  const [trends, setTrends] = useState({ revenueTrend: "0%", revenueUp: true, ordersTrend: "0%", ordersUp: true })
  const [revenueChart, setRevenueChart] = useState([])
  const [categoryChart, setCategoryChart] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true)
      try {
        const [statsRes, ordersRes, productsRes, customersRes, lowStockRes, categoriesRes] = await Promise.allSettled([
          orderApi.getOrderStatistics(),
          orderApi.getOrders({ page: 0, size: 5 }),
          productApi.getProducts({ page: 0, size: 1 }),
          customerApi.getCustomers({ page: 0, size: 1 }),
          inventoryApi.getLowStock(10),
          productApi.getRootCategories(),
        ])

        const statsData = statsRes.status === "fulfilled" ? statsRes.value : null
        const ordersData = ordersRes.status === "fulfilled" ? ordersRes.value : null
        const productsData = productsRes.status === "fulfilled" ? productsRes.value : null
        const customersData = customersRes.status === "fulfilled" ? customersRes.value : null
        const lowStockData = lowStockRes.status === "fulfilled" ? lowStockRes.value : null
        const categoriesData = categoriesRes.status === "fulfilled" ? categoriesRes.value : null

        // KPI: use statistics endpoint for revenue & order count
        setKpi({
          revenue: safeNum(statsData?.todayRevenue),
          orders: safeNum(statsData?.totalOrders),
          products: productsData?.totalElements || 0,
          customers: customersData?.totalElements || 0,
        })

        // Trend: compute from today vs yesterday
        setTrends({
          revenueTrend: calcTrend(statsData?.todayRevenue, statsData?.yesterdayRevenue),
          revenueUp: isTrendUp(statsData?.todayRevenue, statsData?.yesterdayRevenue),
          ordersTrend: calcTrend(statsData?.todayOrders, statsData?.yesterdayOrders),
          ordersUp: isTrendUp(statsData?.todayOrders, statsData?.yesterdayOrders),
        })

        // Revenue chart: last 7 days from backend
        if (statsData?.dailyRevenue?.length) {
          setRevenueChart(statsData.dailyRevenue.map(d => ({
            name: d.name,
            revenue: safeNum(d.revenue),
          })))
        }

        // Category chart: compute from products + categories
        if (productsRes.status === "fulfilled" && categoriesData?.length) {
          // Need all products for category counting
          const allProductsRes = await productApi.getProducts({ page: 0, size: 1000 })
          const products = allProductsRes?.content || []
          const catMap = Object.fromEntries(categoriesData.map(c => [c.id, c.name]))
          const catCount = {}
          products.forEach(p => {
            (p.categoryIds || []).forEach(cid => {
              const name = catMap[cid] || "Khác"
              catCount[name] = (catCount[name] || 0) + 1
            })
          })
          const catData = Object.entries(catCount).map(([name, value]) => ({ name, value }))
          if (catData.length > 0) setCategoryChart(catData)
        }

        if (ordersData?.content?.length) setRecentOrders(ordersData.content.slice(0, 5))
        if (lowStockData?.length) setLowStock(lowStockData)
      } catch {
        // Error — data stays empty
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // Helper: get order amount
  const getAmount = (o) => o.finalAmount ?? o.totalAmount ?? 0
  // Helper: display order id
  const displayId = (o) => {
    if (o.orderCode) return o.orderCode
    const id = String(o.id || "")
    if (id.length > 20) return id.substring(0, 8).toUpperCase()
    return id
  }
  // Helper: get low stock fields
  const getLowSku = (s) => s.productSku || s.sku || "—"
  const getLowQty = (s) => s.quantityOnHand ?? s.quantity ?? 0

  const kpis = [
    { title: "Doanh thu hôm nay", value: formatCurrency(kpi.revenue), icon: DollarSign, trend: trends.revenueTrend, up: trends.revenueUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Đơn hàng", value: safeNum(kpi.orders).toLocaleString(), icon: ShoppingCart, trend: trends.ordersTrend, up: trends.ordersUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Sản phẩm", value: safeNum(kpi.products).toLocaleString(), icon: Package, trend: null, up: true, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Khách hàng", value: safeNum(kpi.customers).toLocaleString(), icon: Users, trend: null, up: true, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <div className="space-y-6">
      {!isManager ? (
        /* ── Employee welcome view ── */
        <>
          <div>
            <h1 className="text-2xl font-bold">Chào mừng bạn đến với SMMS!</h1>
            <p className="text-sm text-muted-foreground mt-1">Sử dụng menu bên trái để truy cập các chức năng của bạn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/my-attendance")}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl p-3 bg-emerald-500/10">
                    <Clock className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Chấm công</p>
                    <p className="text-xs text-muted-foreground">Check-in / Check-out & xem lịch sử</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/my-attendance")}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl p-3 bg-blue-500/10">
                    <CalendarClock className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Lịch ca & Đơn từ</p>
                    <p className="text-xs text-muted-foreground">Xem lịch ca làm & gửi đơn nghỉ phép</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { navigate("/my-attendance"); setTimeout(() => document.querySelector('[value="salary"]')?.click(), 100) }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl p-3 bg-purple-500/10">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Xem lương</p>
                    <p className="text-xs text-muted-foreground">Thông tin lương & lịch sử nhận lương</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* ── Manager/Admin statistics view ── */
        <>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Tổng quan</h1><p className="text-sm text-muted-foreground">Xin chào! Đây là tổng quan hoạt động hôm nay.</p></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{k.title}</p>
                  <p className="text-2xl font-bold">{k.value}</p>
                  {k.trend !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      {k.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                      <span className={k.up ? "text-emerald-500" : "text-red-500"}>{k.trend}</span>
                      <span className="text-muted-foreground">so với hôm qua</span>
                    </div>
                  )}
                </div>
                <div className={`rounded-xl p-3 ${k.bg}`}><k.icon className={`h-6 w-6 ${k.color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Biểu đồ doanh thu tuần</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(safeNum(v) / 1000000).toFixed(0)}tr`} />
                <Tooltip formatter={(v) => [formatCurrency(v), "Doanh thu"]} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Danh mục bán chạy</CardTitle></CardHeader>
          <CardContent>
            {categoryChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryChart} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(safeNum(percent) * 100).toFixed(0)}%`}>
                    {categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">Chưa có dữ liệu danh mục</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>Xem tất cả <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentOrders.map((o, i) => (
                <div key={o.id || i} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium font-mono">{displayId(o)}</p>
                    <p className="text-xs text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(getAmount(o))}</p>
                    <Badge variant={o.status === "COMPLETED" ? "success" : o.status === "CANCELLED" ? "destructive" : "secondary"} className="text-[10px]">
                      {o.status === "COMPLETED" ? "Hoàn thành" : o.status === "CANCELLED" ? "Đã hủy" : o.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && <p className="p-5 text-sm text-muted-foreground text-center">Chưa có đơn hàng</p>}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Cảnh báo tồn kho</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>Xem tất cả <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {lowStock.map((item, i) => (
                <div key={getLowSku(item) || i} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium font-mono">{getLowSku(item)}</p>
                  </div>
                  <Badge variant={getLowQty(item) <= 5 ? "destructive" : "warning"} className="font-bold">
                    Còn {getLowQty(item)}
                  </Badge>
                </div>
              ))}
              {lowStock.length === 0 && <p className="p-5 text-sm text-muted-foreground text-center">Không có cảnh báo</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      </>)}
    </div>
  )
}
