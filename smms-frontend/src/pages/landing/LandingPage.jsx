import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import useStoreConfig from "@/hooks/useStoreConfig"
import {
  Award,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  Facebook,
  Globe,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react"

const iconMap = {
  Package,
  Award,
  Users,
  MapPin,
  Truck,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  MessageCircle,
  Store,
}

function getIcon(name, props = {}) {
  const Icon = iconMap[name]
  return Icon ? <Icon {...props} /> : null
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫"
}

function getTodayIndex() {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

function ProductFallback({ product }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f6ead7,#dff5e8_55%,#dcecff)]">
      <div className="grid h-20 w-20 place-items-center rounded-md border border-white/70 bg-white/55 text-3xl font-extrabold text-emerald-800 shadow-xl backdrop-blur">
        {(product.name || "S").slice(0, 1)}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { config } = useStoreConfig()
  const todayIdx = getTodayIndex()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { label: "Sản phẩm", href: "#products" },
    { label: "Giờ mở cửa", href: "#hours" },
    { label: "Cam kết", href: "#policies" },
    { label: "Liên hệ", href: "#contact" },
  ]

  const renderNavbar = () => (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-[#101820]/86 shadow-2xl shadow-black/20 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <button className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="grid h-10 w-10 place-items-center rounded-md border border-white/20 bg-white/12 text-white shadow-lg backdrop-blur">
              <Store className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{config.name}</span>
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-login-btn"
              onClick={() => navigate("/login")}
              className="hidden items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-bold text-[#101820] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:flex"
            >
              Đăng nhập <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="rounded-md border border-white/15 bg-white/10 p-2 text-white backdrop-blur md:hidden"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-1 pb-4 md:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => navigate("/login")}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-bold text-[#101820]"
            >
              Đăng nhập <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  )

  const renderHero = () => (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-[#101820] pb-12 pt-24 text-white sm:pt-28">
      <img
        src={config.heroImage}
        alt={`${config.name} supermarket`}
        className="absolute inset-0 h-full w-full object-cover slow-pan"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,17,24,.88),rgba(10,17,24,.56)_48%,rgba(10,17,24,.2))]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f7f3ea] to-transparent" />
      <div className="absolute inset-0 soft-grid opacity-35" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_.75fr] lg:px-8">
        <div className="motion-rise max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.9)]" />
            Đang phục vụ hôm nay · {config.businessHours[todayIdx]?.open} - {config.businessHours[todayIdx]?.close}
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {config.name}
            <span className="mt-3 block text-3xl font-extrabold leading-tight text-emerald-200 sm:text-4xl lg:text-5xl">
              Siêu thị tiện lợi cho nhịp sống hiện đại
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">{config.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#products"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-6 py-3.5 text-sm font-extrabold text-[#092016] shadow-2xl shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              <ShoppingCart className="h-5 w-5" />
              Xem sản phẩm nổi bật
              <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/16"
            >
              <Phone className="h-5 w-5" />
              Liên hệ cửa hàng
            </a>
          </div>
        </div>

        <div className="motion-rise hidden lg:block" style={{ animationDelay: "120ms" }}>
          <div className="retail-panel border-white/16 bg-white/12 p-4 text-white shadow-2xl">
            <div className="grid gap-3">
              {config.stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-4 rounded-md bg-white/10 p-4 backdrop-blur">
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-emerald-300/18 text-emerald-100">
                    {getIcon(stat.icon, { className: "h-5 w-5" })}
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold">{stat.value}</div>
                    <div className="text-sm text-white/64">{stat.label}</div>
                  </div>
                  <span className="ml-auto rounded-sm border border-white/10 px-2 py-1 text-[11px] font-bold text-white/62">
                    0{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderTrustStrip = () => (
    <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-3 rounded-md border border-black/5 bg-white p-3 shadow-2xl shadow-slate-900/10 md:grid-cols-3">
        {[
          { icon: BadgeCheck, title: "Nguồn gốc rõ ràng", text: "Sản phẩm chọn lọc mỗi ngày" },
          { icon: Truck, title: "Giao nhanh nội thành", text: "Miễn phí trong bán kính 5km" },
          { icon: WalletCards, title: "Thanh toán linh hoạt", text: "Tiền mặt, thẻ, ví điện tử" },
        ].map((item, index) => (
          <div key={item.title} className="motion-rise flex items-center gap-3 rounded-md bg-[#f7f3ea] p-4" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="grid h-11 w-11 place-items-center rounded-md bg-emerald-700 text-white">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-950">{item.title}</p>
              <p className="text-sm text-slate-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const renderFeaturedProducts = () => (
    <section id="products" className="bg-[#f7f3ea] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-800">
              <Star className="h-4 w-4" /> Sản phẩm được yêu thích
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Kệ hàng hôm nay</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Những sản phẩm quen thuộc được trình bày bằng hình ảnh thật, giúp khách hàng cảm nhận rõ chất lượng trước khi ghé cửa hàng.
            </p>
          </div>
          <a href="#contact" className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800 hover:text-emerald-600">
            Đặt hàng nhanh <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {config.featuredProducts.map((product, index) => (
            <article
              key={product.name}
              className="group motion-rise overflow-hidden rounded-md border border-black/5 bg-white shadow-xl shadow-slate-900/8 transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="image-sheen relative h-56 overflow-hidden bg-slate-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <ProductFallback product={product} />
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-md bg-white px-3 py-1 text-xs font-extrabold text-slate-950 shadow-lg">
                    {product.badge}
                  </span>
                )}
                <span className="absolute bottom-4 left-4 rounded-md border border-white/25 bg-black/25 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {product.category || "SuperMart"}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950">{product.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{product.description}</p>
                  </div>
                  <Sparkles className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-2xl font-extrabold text-emerald-700">{formatPrice(product.price)}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">/{product.unit}</p>
                  </div>
                  <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                    Xem nhanh
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )

  const renderStoreExperience = () => (
    <section id="policies" className="bg-[#101820] py-24 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-extrabold text-emerald-200">
              <Leaf className="h-4 w-4" /> Trải nghiệm mua sắm
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Không chỉ đẹp mắt, mà đáng tin khi vận hành.</h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              Các cam kết của cửa hàng được đưa vào một dải trải nghiệm rõ ràng: giao hàng, đổi trả, thanh toán và nguồn gốc hàng hóa đều dễ nhìn, dễ hiểu.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {config.policies.map((policy, index) => (
              <div
                key={policy.title}
                className="motion-rise rounded-md border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-300/35"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-md bg-emerald-300/14 text-emerald-200">
                  {getIcon(policy.icon, { className: "h-6 w-6" })}
                </div>
                <h3 className="text-lg font-extrabold">{policy.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{policy.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )

  const renderBusinessHours = () => (
    <section id="hours" className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div className="overflow-hidden rounded-md">
          <img
            src={config.experienceImages?.[0] || config.heroImage}
            alt="Fresh produce display"
            className="h-full min-h-[420px] w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="rounded-md border border-slate-200 bg-[#f7f3ea] p-6 shadow-xl shadow-slate-900/8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-extrabold text-emerald-800">
                <CalendarDays className="h-4 w-4" /> Giờ mở cửa
              </div>
              <h2 className="text-3xl font-extrabold text-slate-950">Lịch phục vụ trong tuần</h2>
              <p className="mt-2 text-sm text-slate-600">Hôm nay được đánh dấu để nhân viên và khách hàng đọc nhanh hơn.</p>
            </div>
            <Clock className="h-8 w-8 text-emerald-700" />
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            {config.businessHours.map((item, index) => {
              const isToday = index === todayIdx
              return (
                <div
                  key={item.day}
                  className={`grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition ${
                    isToday ? "bg-emerald-700 text-white" : "border-b border-slate-100 text-slate-800 last:border-b-0 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${isToday ? "bg-emerald-200" : "bg-slate-300"}`} />
                    <span className="font-extrabold">{item.day}</span>
                    {isToday && <span className="rounded-sm bg-white/16 px-2 py-0.5 text-xs font-bold">Hôm nay</span>}
                  </div>
                  <span className="font-mono text-sm font-bold">
                    {item.isOpen ? `${item.open} - ${item.close}` : "Nghỉ"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )

  const renderContact = () => (
    <section id="contact" className="bg-[#f7f3ea] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-extrabold text-emerald-800 shadow-sm">
              <MapPin className="h-4 w-4" /> Ghé SuperMart
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950 sm:text-5xl">Thông tin liên hệ</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Tất cả thông tin quan trọng được gom vào một khu vực thực dụng, dễ đọc trên cả desktop và mobile.</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700"
          >
            Vào hệ thống quản lý <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-3">
            {[
              { icon: MapPin, label: "Địa chỉ", value: config.address },
              { icon: Phone, label: "Điện thoại", value: config.phone },
              { icon: Mail, label: "Email", value: config.email },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-800">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="mt-1 font-bold leading-6 text-slate-900">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              {[
                { icon: Facebook, href: config.social?.facebook, label: "Facebook" },
                { icon: Instagram, href: config.social?.instagram, label: "Instagram" },
                { icon: MessageCircle, href: config.social?.zalo, label: "Zalo" },
              ].filter((item) => item.href).map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700"
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
            <iframe
              title="Bản đồ cửa hàng"
              src={config.mapEmbedUrl}
              className="h-full min-h-[430px] w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )

  const renderFooter = () => (
    <footer className="border-t border-white/10 bg-[#101820] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-400 text-[#092016]">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold">{config.name}</p>
            <p className="text-xs text-white/52">{config.slogan}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-sm font-semibold text-white/60">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-emerald-200">
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-sm text-white/45">© {new Date().getFullYear()} {config.name}. All rights reserved.</p>
      </div>
    </footer>
  )

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f3ea]">
      {renderNavbar()}
      {renderHero()}
      {renderTrustStrip()}
      {renderFeaturedProducts()}
      {renderStoreExperience()}
      {renderBusinessHours()}
      {renderContact()}
      {renderFooter()}
    </div>
  )
}
