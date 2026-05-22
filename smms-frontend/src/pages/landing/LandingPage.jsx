import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useStoreConfig from "@/hooks/useStoreConfig"
import {
  Package, Award, Users, MapPin, Truck, RefreshCw,
  CreditCard, ShieldCheck, Clock, Phone, Mail,
  Globe, Facebook, Instagram, MessageCircle,
  ChevronRight, ShoppingCart, ArrowRight, Star, Sparkles,
  Store, Menu, X
} from "lucide-react"

// ── Icon map — dùng string trong config → component ────────
const iconMap = {
  Package, Award, Users, MapPin, Truck, RefreshCw,
  CreditCard, ShieldCheck, Clock, Phone, Mail, Globe,
  Facebook, Instagram, MessageCircle, Store
}

function getIcon(name, props = {}) {
  const Icon = iconMap[name]
  return Icon ? <Icon {...props} /> : null
}

// ── Helpers ─────────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫"
}

function getTodayIndex() {
  const d = new Date().getDay()          // 0=CN, 1=T2..6=T7
  return d === 0 ? 6 : d - 1            // map → 0=T2..6=CN
}

// ─────────────────────────────────────────────────────────────
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

  // ── Navbar ──────────────────────────────────────────────────
  const Navbar = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a1628]/90 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 border-b border-white/5" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              {config.name}
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Sản phẩm", href: "#products" },
              { label: "Giờ mở cửa", href: "#hours" },
              { label: "Chính sách", href: "#policies" },
              { label: "Liên hệ", href: "#contact" },
            ].map(link => (
              <a key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/5">
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              id="landing-login-btn"
              onClick={() => navigate("/login")}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
            >
              Đăng nhập <ArrowRight className="w-4 h-4" />
            </button>
            {/* Mobile menu btn */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-300 hover:text-white">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-in slide-in-from-top-2">
            {[
              { label: "Sản phẩm", href: "#products" },
              { label: "Giờ mở cửa", href: "#hours" },
              { label: "Chính sách", href: "#policies" },
              { label: "Liên hệ", href: "#contact" },
            ].map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors">
                {link.label}
              </a>
            ))}
            <button onClick={() => navigate("/login")}
              className="w-full mt-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-semibold rounded-xl">
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </nav>
  )

  // ── Hero ────────────────────────────────────────────────────
  const Hero = () => (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#0a1628]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[200px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>Chào mừng đến với {config.name}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          <span className="block">{config.name}</span>
          <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {config.slogan.split("—")[0]?.trim() || config.slogan}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {config.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#products"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 text-base">
            <ShoppingCart className="w-5 h-5" />
            Xem sản phẩm
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#contact"
            className="flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 text-base">
            <Phone className="w-5 h-5" />
            Liên hệ ngay
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs">Cuộn xuống</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )

  // ── Stats ───────────────────────────────────────────────────
  const Stats = () => (
    <section className="relative -mt-20 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {config.stats.map((stat, i) => (
          <div key={i} className="group relative bg-[#111c32]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/30 hover:bg-[#111c32] transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
              {getIcon(stat.icon, { className: "w-6 h-6 text-emerald-400" })}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )

  // ── Featured Products ───────────────────────────────────────
  const FeaturedProducts = () => (
    <section id="products" className="py-24 bg-[#0d1829]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Star className="w-4 h-4" /> Sản phẩm nổi bật
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Sản phẩm được yêu thích</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Những sản phẩm chất lượng cao, giá tốt nhất tại {config.name}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.featuredProducts.map((product, i) => (
            <div key={i} className="group relative bg-[#111c32]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              {/* Product emoji header */}
              <div className="relative h-44 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111c32]/80 to-transparent" />
                <span className="text-7xl group-hover:scale-110 transition-transform duration-500 relative z-10" role="img">{product.emoji}</span>
                {product.badge && (
                  <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">/ {product.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // ── Business Hours ──────────────────────────────────────────
  const BusinessHours = () => (
    <section id="hours" className="py-24 bg-[#0a1628]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Clock className="w-4 h-4" /> Giờ mở cửa
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Thời gian hoạt động</h2>
          <p className="text-slate-400 mt-3">Chúng tôi luôn sẵn sàng phục vụ quý khách</p>
        </div>

        <div className="bg-[#111c32]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
          {config.businessHours.map((item, i) => {
            const isToday = i === todayIdx
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-6 sm:px-8 py-5 transition-all duration-300
                  ${isToday ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-l-4 border-emerald-400" : "hover:bg-white/[0.02]"}
                  ${i < config.businessHours.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {isToday && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />}
                  <span className={`font-semibold ${isToday ? "text-emerald-400" : "text-white"}`}>{item.day}</span>
                  {isToday && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Hôm nay</span>}
                </div>
                <span className={`font-mono text-sm ${isToday ? "text-emerald-300 font-bold" : item.isOpen ? "text-slate-300" : "text-red-400"}`}>
                  {item.isOpen ? `${item.open} – ${item.close}` : "Nghỉ"}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )

  // ── Policies ────────────────────────────────────────────────
  const Policies = () => (
    <section id="policies" className="py-24 bg-[#0d1829]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" /> Cam kết
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Chính sách cửa hàng</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Chúng tôi luôn đặt lợi ích khách hàng lên hàng đầu</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.policies.map((policy, i) => (
            <div key={i} className="group bg-[#111c32]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center hover:border-emerald-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 group-hover:scale-110 transition-all duration-500">
                {getIcon(policy.icon, { className: "w-7 h-7 text-emerald-400" })}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{policy.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{policy.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // ── Contact & Map ───────────────────────────────────────────
  const Contact = () => (
    <section id="contact" className="py-24 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" /> Liên hệ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Thông tin liên hệ</h2>
          <p className="text-slate-400 mt-3">Ghé thăm hoặc liên hệ với chúng tôi</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: "MapPin", label: "Địa chỉ", value: config.address },
              { icon: "Phone", label: "Điện thoại", value: config.phone },
              { icon: "Mail", label: "Email", value: config.email },
            ].map((item, i) => (
              <div key={i} className="group flex items-start gap-4 bg-[#111c32]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                  {getIcon(item.icon, { className: "w-5 h-5 text-emerald-400" })}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-1">{item.label}</div>
                  <div className="text-sm text-white font-medium">{item.value}</div>
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className="flex gap-3 pt-2">
              {config.social.facebook && (
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#111c32]/60 border border-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {config.social.instagram && (
                <a href={config.social.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#111c32]/60 border border-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {config.social.zalo && (
                <a href={config.social.zalo} target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#111c32]/60 border border-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300">
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-white/5 bg-[#111c32]/40 min-h-[350px]">
            <iframe
              title="Bản đồ cửa hàng"
              src={config.mapEmbedUrl}
              className="w-full h-full min-h-[350px]"
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

  // ── Footer ──────────────────────────────────────────────────
  const Footer = () => (
    <footer className="bg-[#070e1b] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">{config.name}</div>
              <div className="text-xs text-slate-500">{config.slogan}</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            {[
              { label: "Sản phẩm", href: "#products" },
              { label: "Giờ mở cửa", href: "#hours" },
              { label: "Chính sách", href: "#policies" },
              { label: "Liên hệ", href: "#contact" },
            ].map(link => (
              <a key={link.href} href={link.href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} {config.name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )

  // ── Main Render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <FeaturedProducts />
      <BusinessHours />
      <Policies />
      <Contact />
      <Footer />
    </div>
  )
}
