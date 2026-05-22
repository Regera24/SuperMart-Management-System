import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { exportToExcel, exportToPdf } from "@/lib/export"
import * as customerApi from "@/api/customerApi"
import { Search, Plus, Eye, Pencil, Download, FileText, Loader2, Phone, Star, Trash2, Crown, Settings, Save, ToggleLeft, ToggleRight, Percent, Coins, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import Pagination from "@/components/ui/pagination"
import CustomerFormDialog from "@/components/customers/CustomerFormDialog"
import CustomerDetailDialog from "@/components/customers/CustomerDetailDialog"

const CUSTOMER_COLUMNS = [
  { key: "fullName", label: "Tên khách hàng" },
  { key: "phone", label: "Số điện thoại" },
  { key: "_tierLabel", label: "Hạng thẻ" },
  { key: "currentPoints", label: "Điểm tích lũy" },
  { key: "_totalSpentFmt", label: "Tổng chi tiêu" },
]

// Backend tier field returns: REGULAR, SILVER, GOLD, DIAMOND
const TIER_COLORS = { REGULAR: "bg-gray-500", BRONZE: "bg-amber-700", SILVER: "bg-gray-400", GOLD: "bg-yellow-500", PLATINUM: "bg-emerald-600", DIAMOND: "bg-purple-600" }
const TIER_LABELS = { REGULAR: "Thường", BRONZE: "Đồng", SILVER: "Bạc", GOLD: "Vàng", PLATINUM: "Bạch kim", DIAMOND: "Kim cương" }

const TIER_GRADIENTS = {
  REGULAR: "from-gray-400 to-gray-600",
  SILVER: "from-slate-300 to-slate-500",
  GOLD: "from-amber-300 via-yellow-400 to-amber-500",
  DIAMOND: "from-violet-400 via-purple-500 to-indigo-600",
}
const TIER_ICONS = {
  REGULAR: "👤", SILVER: "🥈", GOLD: "🥇", DIAMOND: "💎",
}
const TIER_BG = {
  REGULAR: "bg-gray-50 border-gray-200",
  SILVER: "bg-slate-50 border-slate-300",
  GOLD: "bg-amber-50 border-amber-300",
  DIAMOND: "bg-violet-50 border-violet-300",
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [phoneSearch, setPhoneSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [mainTab, setMainTab] = useState("customers")

  // Loyalty rules
  const [loyaltyRules, setLoyaltyRules] = useState([])
  const [loadingRules, setLoadingRules] = useState(false)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editRule, setEditRule] = useState(null)
  const [ruleForm, setRuleForm] = useState({ name: "", description: "", pointsPerUnit: 1, amountPerUnit: 10000, active: true })

  // Tier configs
  const [tierConfigs, setTierConfigs] = useState([])
  const [loadingTiers, setLoadingTiers] = useState(false)
  const [editingTier, setEditingTier] = useState(null) // tierLevel string being edited
  const [tierEditForm, setTierEditForm] = useState({})

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await customerApi.getCustomers({ page, size: pageSize, search: search || undefined })
      setCustomers(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setCustomers([])
      setTotalElements(0)
      toast.error("Không thể tải danh sách khách hàng")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  const fetchLoyaltyRules = useCallback(async () => {
    setLoadingRules(true)
    try {
      const data = await customerApi.getLoyaltyRules()
      setLoyaltyRules(data)
    } catch { setLoyaltyRules([]) }
    finally { setLoadingRules(false) }
  }, [])

  const fetchTierConfigs = useCallback(async () => {
    setLoadingTiers(true)
    try {
      const data = await customerApi.getTierConfigs()
      setTierConfigs(data)
    } catch { setTierConfigs([]) }
    finally { setLoadingTiers(false) }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])
  useEffect(() => { if (mainTab === "loyalty") fetchLoyaltyRules() }, [mainTab, fetchLoyaltyRules])
  useEffect(() => { if (mainTab === "tiers") fetchTierConfigs() }, [mainTab, fetchTierConfigs])

  const startEditTier = (cfg) => {
    setEditingTier(cfg.tierLevel)
    setTierEditForm({
      minPoints: cfg.minPoints ?? 0,
      discountPercent: cfg.discountPercent ?? 0,
      maxDiscountAmount: cfg.maxDiscountAmount ?? 0,
      description: cfg.description || "",
      isActive: cfg.isActive ?? true,
    })
  }
  const cancelEditTier = () => setEditingTier(null)
  const saveTierConfig = async (tierLevel) => {
    try {
      await customerApi.updateTierConfig(tierLevel, tierEditForm)
      toast.success(`Đã cập nhật cấu hình ${TIER_LABELS[tierLevel] || tierLevel}`)
      setEditingTier(null)
      fetchTierConfigs()
    } catch { toast.error("Không thể cập nhật") }
  }

  const handleSearchPhone = async () => {
    if (!phoneSearch) return
    try {
      const c = await customerApi.getCustomerByPhone(phoneSearch)
      if (c) { setCustomers([c]); setTotalElements(1); toast.success(`Tìm thấy: ${c.fullName || c.phone}`) }
    } catch { toast.error("Không tìm thấy khách hàng") }
  }

  // Resolve tier from customer data
  const getTier = (c) => c.tier || c.loyaltyTier || "REGULAR"
  const getPoints = (c) => c.currentPoints ?? c.loyaltyPoints ?? 0

  // Enrich for export
  const enriched = customers.map(c => ({
    ...c,
    _tierLabel: TIER_LABELS[getTier(c)] || getTier(c),
    _totalSpentFmt: formatCurrency(c.totalSpent),
  }))

  const handleExportExcel = () => { exportToExcel(enriched, CUSTOMER_COLUMNS, "khach_hang", "Khách hàng"); toast.success("Xuất Excel thành công!") }
  const handleExportPdf = () => { exportToPdf(enriched, CUSTOMER_COLUMNS, "khach_hang", { title: "Danh sách Khách hàng" }); toast.success("Xuất PDF thành công!") }
  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(-2).toUpperCase() : "KH"

  // Loyalty rule CRUD
  const openRuleForm = (r = null) => {
    setEditRule(r)
    if (r) {
      // Map backend fields back to form fields
      const rate = r.pointConversionRate ? parseFloat(r.pointConversionRate) : 0
      // pointConversionRate = pointsPerUnit / amountPerUnit  →  reverse: pointsPerUnit = rate * amountPerUnit
      const amountPerUnit = r.minOrderValue ? parseFloat(r.minOrderValue) : 10000
      const pointsPerUnit = rate > 0 ? Math.round(rate * amountPerUnit) : 1
      setRuleForm({ name: r.name || "", description: r.description || "", pointsPerUnit, amountPerUnit, active: r.isActive ?? true })
    } else {
      setRuleForm({ name: "", description: "", pointsPerUnit: 1, amountPerUnit: 10000, active: true })
    }
    setShowRuleForm(true)
  }
  const saveRule = async () => {
    try {
      // Convert frontend form fields to backend DTO fields
      const payload = {
        name: ruleForm.name,
        pointConversionRate: ruleForm.amountPerUnit > 0
          ? (ruleForm.pointsPerUnit / ruleForm.amountPerUnit) : 0.0001,
        minOrderValue: ruleForm.amountPerUnit || 0,
        isActive: ruleForm.active ?? true,
        priority: 0,
      }
      if (editRule) await customerApi.updateLoyaltyRule(editRule.id, payload)
      else await customerApi.createLoyaltyRule(payload)
      toast.success(editRule ? "Đã cập nhật quy tắc" : "Đã thêm quy tắc")
      setShowRuleForm(false)
      fetchLoyaltyRules()
    } catch { toast.error("Lỗi khi lưu quy tắc") }
  }
  const handleDeleteRule = async (id) => {
    if (!confirm("Xác nhận xoá quy tắc tích điểm?")) return
    try { await customerApi.deleteLoyaltyRule(id); toast.success("Đã xoá"); fetchLoyaltyRules() }
    catch { toast.error("Không thể xoá") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quản lý Khách hàng</h1><p className="text-sm text-muted-foreground">{totalElements} khách hàng</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white" onClick={() => { setEditCustomer(null); setShowForm(true) }}><Plus className="h-4 w-4 mr-2" /> Thêm khách hàng</Button>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="customers">Danh sách KH</TabsTrigger>
          <TabsTrigger value="loyalty"><Star className="h-3.5 w-3.5 mr-1" /> Quy tắc tích điểm</TabsTrigger>
          <TabsTrigger value="tiers"><Crown className="h-3.5 w-3.5 mr-1" /> Cấu hình Rank & Giảm giá</TabsTrigger>
        </TabsList>

        {/* ── Customers Tab ── */}
        <TabsContent value="customers" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm theo tên..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></div>
            <div className="flex gap-1"><Input placeholder="Tìm SĐT..." className="w-40" value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearchPhone()} /><Button variant="outline" size="icon" onClick={handleSearchPhone}><Phone className="h-4 w-4" /></Button></div>
          </div>
          <Card><CardContent className="p-0">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Khách hàng</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">SĐT</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Hạng thẻ</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Điểm</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Tổng chi tiêu</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
            </tr></thead><tbody>
              {customers.map((c) => {
                const tier = getTier(c)
                const points = getPoints(c)
                return (
                <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(c.fullName)}</AvatarFallback></Avatar><span className="text-sm font-medium">{c.fullName}</span></div></td>
                  <td className="p-3 text-sm font-mono">{c.phone}</td>
                  <td className="p-3 text-center"><Badge className={`${TIER_COLORS[tier] || "bg-gray-500"} text-white`}>{TIER_LABELS[tier] || tier || "—"}</Badge></td>
                  <td className="p-3 text-sm text-right font-bold text-amber-500">{(points).toLocaleString()}</td>
                  <td className="p-3 text-sm text-right font-medium">{formatCurrency(c.totalSpent)}</td>
                  <td className="p-3"><div className="flex justify-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailId(c.id); setShowDetail(true) }}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCustomer(c); setShowForm(true) }}><Pencil className="h-3.5 w-3.5" /></Button></div></td>
                </tr>
              )})}
              {customers.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Không tìm thấy khách hàng</td></tr>}
            </tbody></table></div>
            )}
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0) }} label="khách hàng" />
          </CardContent></Card>
        </TabsContent>

        {/* ── Loyalty Rules Tab ── */}
        <TabsContent value="loyalty" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Quy tắc tích điểm tự động khi hoàn thành đơn hàng</p>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={() => openRuleForm()}><Plus className="h-4 w-4 mr-2" /> Thêm quy tắc</Button>
          </div>
          <Card><CardContent className="p-0">
            {loadingRules ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <table className="w-full"><thead><tr className="border-b bg-muted/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Tên quy tắc</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Mô tả</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Điểm / đơn vị</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Số tiền / đơn vị (₫)</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Trạng thái</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">Thao tác</th>
            </tr></thead><tbody>
              {loyaltyRules.map((r) => (
                <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{r.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{r.description || "—"}</td>
                  <td className="p-3 text-sm text-right font-bold text-amber-500">{r.pointsPerUnit}</td>
                  <td className="p-3 text-sm text-right font-medium">{(r.amountPerUnit || 0).toLocaleString("vi-VN")}</td>
                  <td className="p-3 text-center"><Badge variant={r.active ? "success" : "secondary"}>{r.active ? "Hoạt động" : "Tắt"}</Badge></td>
                  <td className="p-3"><div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openRuleForm(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteRule(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></td>
                </tr>
              ))}
              {loyaltyRules.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Chưa có quy tắc tích điểm</td></tr>}
            </tbody></table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* ── Tier Configs Tab ── */}
        <TabsContent value="tiers" className="mt-4 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Cấu hình quy đổi điểm → giảm giá (%) theo hạng thẻ khách hàng</p>
            </div>
          </div>

          {loadingTiers ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {tierConfigs.map((cfg) => {
                const isEditing = editingTier === cfg.tierLevel
                const gradient = TIER_GRADIENTS[cfg.tierLevel] || TIER_GRADIENTS.REGULAR
                const icon = TIER_ICONS[cfg.tierLevel] || "👤"
                const cardBg = TIER_BG[cfg.tierLevel] || TIER_BG.REGULAR

                return (
                  <Card key={cfg.tierLevel} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${cardBg} border-2 ${isEditing ? "ring-2 ring-primary shadow-xl scale-[1.02]" : ""}`}>
                    {/* Gradient header band */}
                    <div className={`h-2 bg-gradient-to-r ${gradient}`} />

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{icon}</span>
                          <div>
                            <CardTitle className="text-lg font-bold">{TIER_LABELS[cfg.tierLevel] || cfg.tierLevel}</CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{cfg.tierLevel}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!isEditing ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditTier(cfg)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          ) : (
                            <>
                              <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => saveTierConfig(cfg.tierLevel)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEditTier}>
                                <span className="text-xs">✕</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Active/inactive toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Trạng thái</span>
                        {isEditing ? (
                          <button onClick={() => setTierEditForm(f => ({ ...f, isActive: !f.isActive }))} className="flex items-center gap-1">
                            {tierEditForm.isActive ? <ToggleRight className="h-6 w-6 text-emerald-500" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                            <span className={`text-xs font-medium ${tierEditForm.isActive ? "text-emerald-600" : "text-gray-400"}`}>{tierEditForm.isActive ? "Bật" : "Tắt"}</span>
                          </button>
                        ) : (
                          <Badge variant={cfg.isActive ? "success" : "secondary"}>{cfg.isActive ? "Hoạt động" : "Tắt"}</Badge>
                        )}
                      </div>

                      {/* Min Points */}
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Coins className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-medium text-muted-foreground">Ngưỡng điểm tối thiểu</span>
                        </div>
                        {isEditing ? (
                          <Input type="number" min={0} value={tierEditForm.minPoints} onChange={e => setTierEditForm(f => ({ ...f, minPoints: parseInt(e.target.value) || 0 }))} className="h-9" />
                        ) : (
                          <p className="text-lg font-bold text-amber-600">{(cfg.minPoints || 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">điểm</span></p>
                        )}
                      </div>

                      {/* Discount % */}
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Percent className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-xs font-medium text-muted-foreground">Giảm giá</span>
                        </div>
                        {isEditing ? (
                          <Input type="number" step="0.5" min={0} max={100} value={tierEditForm.discountPercent} onChange={e => setTierEditForm(f => ({ ...f, discountPercent: parseFloat(e.target.value) || 0 }))} className="h-9" />
                        ) : (
                          <p className="text-2xl font-extrabold text-emerald-600">{parseFloat(cfg.discountPercent || 0)}%</p>
                        )}
                      </div>

                      {/* Max Discount Amount */}
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs font-medium text-muted-foreground">Giảm tối đa</span>
                        </div>
                        {isEditing ? (
                          <Input type="number" min={0} step={10000} value={tierEditForm.maxDiscountAmount} onChange={e => setTierEditForm(f => ({ ...f, maxDiscountAmount: parseFloat(e.target.value) || 0 }))} className="h-9" />
                        ) : (
                          <p className="text-sm font-semibold">{formatCurrency(cfg.maxDiscountAmount)}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Mô tả</span>
                        {isEditing ? (
                          <Input value={tierEditForm.description} onChange={e => setTierEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả ưu đãi..." className="h-9 mt-1" />
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">{cfg.description || "—"}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {tierConfigs.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  Chưa có cấu hình rank. Hãy khởi động lại customer-service để seed dữ liệu mặc định.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CustomerFormDialog open={showForm} onOpenChange={setShowForm} customer={editCustomer} onSuccess={fetchCustomers} />
      <CustomerDetailDialog open={showDetail} onOpenChange={setShowDetail} customerId={detailId} />

      {/* ── Loyalty Rule Form Dialog ── */}
      <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editRule ? "Sửa quy tắc tích điểm" : "Thêm quy tắc tích điểm"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Tên quy tắc *</label><Input value={ruleForm.name} onChange={e => setRuleForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Tích 1 điểm / 10.000đ" /></div>
            <div><label className="text-sm font-medium">Mô tả</label><Input value={ruleForm.description} onChange={e => setRuleForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả chi tiết" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Điểm / đơn vị</label><Input type="number" value={ruleForm.pointsPerUnit} onChange={e => setRuleForm(f => ({ ...f, pointsPerUnit: parseInt(e.target.value) || 1 }))} /></div>
              <div><label className="text-sm font-medium">Số tiền / đơn vị (₫)</label><Input type="number" value={ruleForm.amountPerUnit} onChange={e => setRuleForm(f => ({ ...f, amountPerUnit: parseInt(e.target.value) || 10000 }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="activeRule" checked={ruleForm.active} onChange={e => setRuleForm(f => ({ ...f, active: e.target.checked }))} />
              <label htmlFor="activeRule" className="text-sm font-medium">Hoạt động</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRuleForm(false)}>Huỷ</Button>
              <Button onClick={saveRule} disabled={!ruleForm.name}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
