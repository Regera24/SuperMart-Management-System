import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, safeNum } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import * as orderApi from "@/api/orderApi"
import * as productApi from "@/api/productApi"
import * as customerApi from "@/api/customerApi"
import * as inventoryApi from "@/api/inventoryApi"
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Clock,
  DollarSign,
  Gauge,
  Package,
  ReceiptText,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react"

const COLORS = ["#16a34a", "#0284c7", "#f59e0b", "#dc2626", "#7c3aed", "#db2777"]

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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-xl">
      <p className="font-extrabold">{label}</p>
      <p className="text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  )
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

        setKpi({
          revenue: safeNum(statsData?.todayRevenue),
          orders: safeNum(statsData?.totalOrders),
          products: productsData?.totalElements || 0,
          customers: customersData?.totalElements || 0,
        })

        setTrends({
          revenueTrend: calcTrend(statsData?.todayRevenue, statsData?.yesterdayRevenue),
          revenueUp: isTrendUp(statsData?.todayRevenue, statsData?.yesterdayRevenue),
          ordersTrend: calcTrend(statsData?.todayOrders, statsData?.yesterdayOrders),
          ordersUp: isTrendUp(statsData?.todayOrders, statsData?.yesterdayOrders),
        })

        if (statsData?.dailyRevenue?.length) {
          setRevenueChart(statsData.dailyRevenue.map((item) => ({ name: item.name, revenue: safeNum(item.revenue) })))
        }

        if (productsRes.status === "fulfilled" && categoriesData?.length) {
          const allProductsRes = await productApi.getProducts({ page: 0, size: 1000 })
          const products = allProductsRes?.content || []
          const catMap = Object.fromEntries(categoriesData.map((category) => [category.id, category.name]))
          const catCount = {}
          products.forEach((product) => {
            ;(product.categoryIds || []).forEach((categoryId) => {
              const name = catMap[categoryId] || "Khác"
              catCount[name] = (catCount[name] || 0) + 1
            })
          })
          const catData = Object.entries(catCount).map(([name, value]) => ({ name, value }))
          if (catData.length > 0) setCategoryChart(catData)
        }

        if (ordersData?.content?.length) setRecentOrders(ordersData.content.slice(0, 5))
        if (lowStockData?.length) setLowStock(lowStockData)
      } catch {
        // Keep empty dashboard state when one of the service calls fails.
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const getAmount = (order) => order.finalAmount ?? order.totalAmount ?? 0
  const displayId = (order) => {
    if (order.orderCode) return order.orderCode
    const id = String(order.id || "")
    if (id.length > 20) return id.substring(0, 8).toUpperCase()
    return id
  }
  const getLowSku = (stock) => stock.productSku || stock.sku || "—"
  const getLowQty = (stock) => stock.quantityOnHand ?? stock.quantity ?? 0

  const kpis = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(kpi.revenue),
      icon: DollarSign,
      trend: trends.revenueTrend,
      up: trends.revenueUp,
      tone: "emerald",
      caption: "Dòng tiền tại quầy",
    },
    {
      title: "Đơn hàng",
      value: safeNum(kpi.orders).toLocaleString(),
      icon: ShoppingCart,
      trend: trends.ordersTrend,
      up: trends.ordersUp,
      tone: "blue",
      caption: "Tổng đơn trong hệ thống",
    },
    {
      title: "Sản phẩm",
      value: safeNum(kpi.products).toLocaleString(),
      icon: Package,
      trend: null,
      up: true,
      tone: "amber",
      caption: "SKU đang quản lý",
    },
    {
      title: "Khách hàng",
      value: safeNum(kpi.customers).toLocaleString(),
      icon: Users,
      trend: null,
      up: true,
      tone: "purple",
      caption: "Hồ sơ loyalty",
    },
  ]

  const toneClasses = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
  }

  if (!isManager) {
    const employeeActions = [
      {
        title: "Chấm công",
        desc: "Check-in / Check-out và xem lịch sử",
        icon: Clock,
        tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        onClick: () => navigate("/my-attendance"),
      },
      {
        title: "Lịch ca & đơn từ",
        desc: "Xem lịch làm và gửi đơn nghỉ phép",
        icon: CalendarClock,
        tone: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
        onClick: () => navigate("/my-attendance"),
      },
      {
        title: "Xem lương",
        desc: "Thông tin lương và lịch sử nhận lương",
        icon: WalletCards,
        tone: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
        onClick: () => {
          navigate("/my-attendance")
          setTimeout(() => document.querySelector('[value="salary"]')?.click(), 100)
        },
      },
    ]

    return (
      <div className="space-y-6">
        <section className="retail-card overflow-hidden p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
                <Store className="h-4 w-4" /> Personal work hub
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Chào mừng bạn đến với SMMS!</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Các tác vụ trong ca làm được gom lại để bạn thao tác nhanh hơn.</p>
            </div>
            <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
              Hôm nay · {new Date().toLocaleDateString("vi-VN")}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employeeActions.map((action) => (
            <button key={action.title} className="retail-card group p-5 text-left transition hover:-translate-y-1 hover:border-primary/35" onClick={action.onClick}>
              <div className="flex items-center gap-4">
                <div className={`grid h-12 w-12 place-items-center rounded-md ${action.tone}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold">{action.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="retail-card overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              <Gauge className="h-4 w-4" />
              Store pulse {loading ? "· đang đồng bộ" : "· đã cập nhật"}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Tổng quan vận hành hôm nay</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Theo dõi dòng tiền, đơn hàng, tồn kho và dữ liệu khách hàng trong một bảng điều phối gọn, dễ quét.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Đơn mới", value: safeNum(kpi.orders).toLocaleString(), icon: ReceiptText },
              { label: "SKU", value: safeNum(kpi.products).toLocaleString(), icon: Package },
              { label: "Khách", value: safeNum(kpi.customers).toLocaleString(), icon: Users },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-border bg-muted/45 p-4">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-xl font-extrabold">{item.value}</p>
                <p className="text-xs font-bold text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.title} className="retail-card group p-5 transition hover:-translate-y-1 hover:border-primary/30">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-muted-foreground">{item.title}</p>
                <p className="mt-2 truncate text-2xl font-extrabold tracking-tight">{item.value}</p>
              </div>
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-md ${toneClasses[item.tone]}`}>
                <item.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs font-medium text-muted-foreground">{item.caption}</span>
              {item.trend !== null ? (
                <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${item.up ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>
                  {item.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {item.trend}
                </span>
              ) : (
                <span className="text-xs font-extrabold text-muted-foreground">Live</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="retail-card xl:col-span-2">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-extrabold">Doanh thu 7 ngày</h2>
              <p className="mt-1 text-sm text-muted-foreground">Xu hướng bán hàng theo ngày</p>
            </div>
            <Badge variant="secondary" className="font-extrabold">Revenue</Badge>
          </div>
          <div className="p-5">
            {revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} tickFormatter={(value) => `${(safeNum(value) / 1000000).toFixed(0)}tr`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-[310px] place-items-center rounded-md bg-muted/40 text-sm text-muted-foreground">Chưa có dữ liệu doanh thu</div>
            )}
          </div>
        </section>

        <section className="retail-card">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-extrabold">Danh mục bán chạy</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tỷ trọng sản phẩm theo danh mục</p>
          </div>
          <div className="p-5">
            {categoryChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={310}>
                <PieChart>
                  <Pie
                    data={categoryChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={108}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(safeNum(percent) * 100).toFixed(0)}%`}
                  >
                    {categoryChart.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-[310px] place-items-center rounded-md bg-muted/40 text-sm text-muted-foreground">Chưa có dữ liệu danh mục</div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="retail-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-extrabold">Đơn hàng gần đây</h2>
              <p className="mt-1 text-sm text-muted-foreground">Luồng giao dịch mới nhất</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((order, index) => (
              <div key={order.id || index} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-muted/30">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-extrabold">{displayId(order)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold">{formatCurrency(getAmount(order))}</p>
                  <Badge variant={order.status === "COMPLETED" ? "success" : order.status === "CANCELLED" ? "destructive" : "secondary"} className="mt-1 text-[10px]">
                    {order.status === "COMPLETED" ? "Hoàn thành" : order.status === "CANCELLED" ? "Đã hủy" : order.status}
                  </Badge>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Chưa có đơn hàng</p>}
          </div>
        </section>

        <section className="retail-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Cảnh báo tồn kho
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Các SKU cần kiểm tra trước</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {lowStock.map((item, index) => {
              const qty = getLowQty(item)
              return (
                <div key={getLowSku(item) || index} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-amber-500/10 text-amber-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-extrabold">{getLowSku(item)}</p>
                      <p className="text-xs text-muted-foreground">Cần kiểm kho</p>
                    </div>
                  </div>
                  <Badge variant={qty <= 5 ? "destructive" : "warning"} className="font-extrabold">
                    Còn {qty}
                  </Badge>
                </div>
              )
            })}
            {lowStock.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Không có cảnh báo</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
