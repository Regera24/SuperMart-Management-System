import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, safeNum } from "@/lib/utils"
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import * as orderApi from "@/api/orderApi"
import * as productApi from "@/api/productApi"
import * as customerApi from "@/api/customerApi"
import * as inventoryApi from "@/api/inventoryApi"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]



export default function DashboardPage() {
  const navigate = useNavigate()
  const [kpi, setKpi] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 })
  const [revenueChart, setRevenueChart] = useState([])
  const [categoryChart, setCategoryChart] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true)
      try {
        const [ordersRes, productsRes, customersRes, lowStockRes] = await Promise.allSettled([
          orderApi.getOrders({ page: 0, size: 5 }),
          productApi.getProducts({ page: 0, size: 1 }),
          customerApi.getCustomers({ page: 0, size: 1 }),
          inventoryApi.getLowStock(10),
        ])

        const ordersData = ordersRes.status === "fulfilled" ? ordersRes.value : null
        const productsData = productsRes.status === "fulfilled" ? productsRes.value : null
        const customersData = customersRes.status === "fulfilled" ? customersRes.value : null
        const lowStockData = lowStockRes.status === "fulfilled" ? lowStockRes.value : null

        if (ordersData || productsData || customersData) {
          setKpi({
            revenue: ordersData?.content?.reduce((sum, o) => sum + safeNum(o.finalAmount ?? o.totalAmount), 0) || 0,
            orders: ordersData?.totalElements || 0,
            products: productsData?.totalElements || 0,
            customers: customersData?.totalElements || 0,
          })
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
    { title: "Doanh thu hôm nay", value: formatCurrency(kpi.revenue), icon: DollarSign, trend: "+12.5%", up: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Đơn hàng", value: safeNum(kpi.orders).toLocaleString(), icon: ShoppingCart, trend: "+8.2%", up: true, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Sản phẩm", value: safeNum(kpi.products).toLocaleString(), icon: Package, trend: "+3", up: true, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Khách hàng", value: safeNum(kpi.customers).toLocaleString(), icon: Users, trend: "+5.1%", up: true, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <div className="space-y-6">
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
                  <div className="flex items-center gap-1 text-xs">
                    {k.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                    <span className={k.up ? "text-emerald-500" : "text-red-500"}>{k.trend}</span>
                    <span className="text-muted-foreground">so với hôm qua</span>
                  </div>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryChart} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(safeNum(percent) * 100).toFixed(0)}%`}>
                  {categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
    </div>
  )
}
