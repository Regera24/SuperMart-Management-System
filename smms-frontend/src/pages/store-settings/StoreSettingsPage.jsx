import { useState } from "react"
import useStoreConfig from "@/hooks/useStoreConfig"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Store, Clock, Star, ShieldCheck, MapPin, Save, RotateCcw, ExternalLink,
  Loader2, Plus, Trash2, Package, Award, Users, Truck, RefreshCw,
  CreditCard, Phone, Mail, Globe, Facebook, Instagram, MessageCircle
} from "lucide-react"
import { toast } from "sonner"

// Icon options for policies
const POLICY_ICONS = [
  { value: "Truck", label: "Giao hàng", Icon: Truck },
  { value: "RefreshCw", label: "Đổi trả", Icon: RefreshCw },
  { value: "CreditCard", label: "Thanh toán", Icon: CreditCard },
  { value: "ShieldCheck", label: "Bảo đảm", Icon: ShieldCheck },
  { value: "Package", label: "Đóng gói", Icon: Package },
]

// Icon options for stats
const STAT_ICONS = [
  { value: "Package", label: "Sản phẩm" },
  { value: "Award", label: "Giải thưởng" },
  { value: "Users", label: "Người dùng" },
  { value: "MapPin", label: "Địa điểm" },
  { value: "Store", label: "Cửa hàng" },
]

export default function StoreSettingsPage() {
  const { config, saveConfig, resetConfig } = useStoreConfig()
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(config)))
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState("general")

  // Generic field updater
  const set = (path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split(".")
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].match(/^\d+$/)) keys[i] = parseInt(keys[i])
        obj = obj[keys[i]]
      }
      const lastKey = keys[keys.length - 1].match(/^\d+$/) ? parseInt(keys[keys.length - 1]) : keys[keys.length - 1]
      obj[lastKey] = value
      return next
    })
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      saveConfig(draft)
      setSaving(false)
      toast.success("Đã lưu cấu hình cửa hàng!", { description: "Thay đổi sẽ hiển thị trên Landing Page." })
    }, 400)
  }

  const handleReset = () => {
    if (!confirm("Xác nhận khôi phục cấu hình mặc định? Mọi thay đổi sẽ bị mất.")) return
    resetConfig()
    setDraft(JSON.parse(JSON.stringify(config)))
    // re-read from default since resetConfig clears localStorage
    window.location.reload()
  }

  const handlePreview = () => {
    // Save first, then open preview
    saveConfig(draft)
    window.open("/landing", "_blank")
  }

  // ── Tab: Thông tin chung ──────────────────────────────────
  const GeneralTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Thương hiệu</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tên cửa hàng</label>
              <Input className="mt-1" value={draft.name} onChange={e => set("name", e.target.value)} placeholder="SuperMart" />
            </div>
            <div>
              <label className="text-sm font-medium">Năm thành lập</label>
              <Input className="mt-1" type="number" value={draft.foundedYear} onChange={e => set("foundedYear", parseInt(e.target.value) || 2020)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Slogan</label>
            <Input className="mt-1" value={draft.slogan} onChange={e => set("slogan", e.target.value)} placeholder="Siêu thị tiện lợi..." />
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
              value={draft.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Mô tả về cửa hàng..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Số liệu nổi bật</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {draft.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Nhãn</label>
                <Input className="mt-1" value={stat.label} onChange={e => set(`stats.${i}.label`, e.target.value)} />
              </div>
              <div className="col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Giá trị</label>
                <Input className="mt-1" value={stat.value} onChange={e => set(`stats.${i}.value`, e.target.value)} />
              </div>
              <div className="col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Icon</label>
                <select className="mt-1 w-full h-9 rounded-lg border border-input bg-background px-3 text-sm" value={stat.icon} onChange={e => set(`stats.${i}.icon`, e.target.value)}>
                  {STAT_ICONS.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                </select>
              </div>
              <div className="col-span-3 flex gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => {
                  const next = [...draft.stats]; next.splice(i, 1); setDraft(p => ({ ...p, stats: next }))
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setDraft(p => ({ ...p, stats: [...p.stats, { label: "", value: "", icon: "Package" }] }))}>
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // ── Tab: Giờ mở cửa ──────────────────────────────────────
  const HoursTab = () => (
    <Card>
      <CardHeader><CardTitle className="text-lg">Giờ hoạt động theo ngày</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {draft.businessHours.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="col-span-3 font-medium text-sm">{item.day}</div>
            <div className="col-span-3">
              <Input type="time" value={item.open} onChange={e => set(`businessHours.${i}.open`, e.target.value)} disabled={!item.isOpen} />
            </div>
            <div className="col-span-3">
              <Input type="time" value={item.close} onChange={e => set(`businessHours.${i}.close`, e.target.value)} disabled={!item.isOpen} />
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={item.isOpen} onChange={e => set(`businessHours.${i}.isOpen`, e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
              <span className={`text-xs font-medium ${item.isOpen ? "text-emerald-500" : "text-destructive"}`}>
                {item.isOpen ? "Mở cửa" : "Nghỉ"}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  // ── Tab: Sản phẩm nổi bật ────────────────────────────────
  const ProductsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sản phẩm nổi bật</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setDraft(p => ({
            ...p,
            featuredProducts: [...p.featuredProducts, { name: "", price: 0, unit: "", description: "", badge: "", emoji: "📦" }]
          }))}>
            <Plus className="h-4 w-4 mr-1" /> Thêm sản phẩm
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {draft.featuredProducts.map((product, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Sản phẩm #{i + 1}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                const next = [...draft.featuredProducts]; next.splice(i, 1); setDraft(p => ({ ...p, featuredProducts: next }))
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-1">
                <label className="text-xs font-medium text-muted-foreground">Emoji</label>
                <Input className="mt-1 text-center text-lg" value={product.emoji} onChange={e => set(`featuredProducts.${i}.emoji`, e.target.value)} />
              </div>
              <div className="col-span-4">
                <label className="text-xs font-medium text-muted-foreground">Tên sản phẩm</label>
                <Input className="mt-1" value={product.name} onChange={e => set(`featuredProducts.${i}.name`, e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Giá (₫)</label>
                <Input className="mt-1" type="number" value={product.price} onChange={e => set(`featuredProducts.${i}.price`, parseInt(e.target.value) || 0)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Đơn vị</label>
                <Input className="mt-1" value={product.unit} onChange={e => set(`featuredProducts.${i}.unit`, e.target.value)} />
              </div>
              <div className="col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Badge</label>
                <Input className="mt-1" value={product.badge || ""} onChange={e => set(`featuredProducts.${i}.badge`, e.target.value || null)} placeholder="VD: Best Seller" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mô tả</label>
              <Input className="mt-1" value={product.description} onChange={e => set(`featuredProducts.${i}.description`, e.target.value)} placeholder="Mô tả ngắn..." />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  // ── Tab: Chính sách ───────────────────────────────────────
  const PoliciesTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chính sách cửa hàng</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setDraft(p => ({
            ...p,
            policies: [...p.policies, { title: "", description: "", icon: "ShieldCheck" }]
          }))}>
            <Plus className="h-4 w-4 mr-1" /> Thêm chính sách
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {draft.policies.map((policy, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Chính sách #{i + 1}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                const next = [...draft.policies]; next.splice(i, 1); setDraft(p => ({ ...p, policies: next }))
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Icon</label>
                <select className="mt-1 w-full h-9 rounded-lg border border-input bg-background px-3 text-sm" value={policy.icon} onChange={e => set(`policies.${i}.icon`, e.target.value)}>
                  {POLICY_ICONS.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                </select>
              </div>
              <div className="col-span-9">
                <label className="text-xs font-medium text-muted-foreground">Tiêu đề</label>
                <Input className="mt-1" value={policy.title} onChange={e => set(`policies.${i}.title`, e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nội dung</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring"
                value={policy.description}
                onChange={e => set(`policies.${i}.description`, e.target.value)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  // ── Tab: Liên hệ ─────────────────────────────────────────
  const ContactTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Thông tin liên hệ</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <Input className="mt-1" value={draft.address} onChange={e => set("address", e.target.value)} placeholder="123 Nguyễn Văn Linh..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input className="mt-1" value={draft.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input className="mt-1" value={draft.email} onChange={e => set("email", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Website</label>
            <Input className="mt-1" value={draft.website || ""} onChange={e => set("website", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Google Maps</CardTitle></CardHeader>
        <CardContent>
          <label className="text-sm font-medium">Embed URL</label>
          <Input className="mt-1" value={draft.mapEmbedUrl} onChange={e => set("mapEmbedUrl", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
          <p className="text-xs text-muted-foreground mt-2">Lấy URL embed từ Google Maps → Share → Embed a map → Copy src</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Mạng xã hội</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Facebook className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input value={draft.social?.facebook || ""} onChange={e => set("social.facebook", e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input value={draft.social?.instagram || ""} onChange={e => set("social.instagram", e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input value={draft.social?.zalo || ""} onChange={e => set("social.zalo", e.target.value)} placeholder="https://zalo.me/..." />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ── Main Render ───────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Landing Page</h1>
          <p className="text-sm text-muted-foreground">Chỉnh sửa nội dung hiển thị trên trang giới thiệu cửa hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <ExternalLink className="h-4 w-4 mr-1" /> Xem trước
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive">
            <RotateCcw className="h-4 w-4 mr-1" /> Khôi phục mặc định
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</> : <><Save className="h-4 w-4 mr-2" />Lưu thay đổi</>}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="general"><Store className="h-4 w-4 mr-1" /> Thông tin chung</TabsTrigger>
          <TabsTrigger value="hours"><Clock className="h-4 w-4 mr-1" /> Giờ mở cửa</TabsTrigger>
          <TabsTrigger value="products"><Star className="h-4 w-4 mr-1" /> Sản phẩm</TabsTrigger>
          <TabsTrigger value="policies"><ShieldCheck className="h-4 w-4 mr-1" /> Chính sách</TabsTrigger>
          <TabsTrigger value="contact"><MapPin className="h-4 w-4 mr-1" /> Liên hệ</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6"><GeneralTab /></TabsContent>
        <TabsContent value="hours" className="mt-6"><HoursTab /></TabsContent>
        <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
        <TabsContent value="policies" className="mt-6"><PoliciesTab /></TabsContent>
        <TabsContent value="contact" className="mt-6"><ContactTab /></TabsContent>
      </Tabs>
    </div>
  )
}
