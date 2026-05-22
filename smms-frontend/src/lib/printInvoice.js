/**
 * Tạo HTML nội dung hóa đơn (không tự động in).
 * Dùng để hiển thị preview trong iframe hoặc cửa sổ mới.
 */
export function buildInvoiceHTML(order, cart = [], customer = null, cashier = null) {
  const fmt = (v) => {
    const n = Number(v)
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(isNaN(n) ? 0 : n)
  }

  const now = order?.createdAt
    ? new Date(order.createdAt).toLocaleString("vi-VN")
    : new Date().toLocaleString("vi-VN")

  const items = order?.items?.length
    ? order.items.map((i) => ({
        name: i.productName,
        qty: i.quantity,
        price: Number(i.unitPrice),
        total: Number(i.subTotal ?? i.unitPrice * i.quantity),
      }))
    : cart.map((i) => ({
        name: i.name,
        qty: i.qty,
        price: Number(i.price),
        total: Number(i.price) * i.qty,
      }))

  const subTotal = Number(order?.subTotal ?? items.reduce((s, i) => s + i.total, 0))
  const discount = Number(order?.discountAmount ?? 0)
  const finalAmount = Number(order?.finalAmount ?? subTotal - discount)

  const paymentLabels = {
    CASH: "Tiền mặt",
    CREDIT_CARD: "Thẻ",
    BANK_TRANSFER: "Chuyển khoản",
    QR_CODE: "QR Code",
    WALLET: "Ví điện tử",
  }
  const paymentText = paymentLabels[order?.paymentMethod] || order?.paymentMethod || "—"

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8"/>
  <title>Hóa đơn ${order?.orderCode || ""}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size:80mm auto; margin:4mm; }
    @media print {
      body { width: 72mm !important; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 13px;
      color: #222;
      width: 100%;
      max-width: 360px;
      margin: 0 auto;
      padding: 12px 8px;
      background: #fff;
    }
    .center { text-align:center; }
    .bold   { font-weight:700; }
    .store-name { font-size:20px; font-weight:800; letter-spacing:1px; margin-bottom:2px; }
    .divider { border-top:1px dashed #aaa; margin:8px 0; }
    .row { display:flex; justify-content:space-between; padding:2px 0; }
    .row.header { font-weight:700; border-bottom:1px solid #333; padding-bottom:4px; margin-bottom:4px; }
    .item-name { flex:1; padding-right:4px; }
    .item-qty  { width:30px; text-align:center; }
    .item-price { width:72px; text-align:right; }
    .item-total { width:80px; text-align:right; font-weight:600; }
    .summary .row { padding:3px 0; }
    .grand-total { font-size:16px; font-weight:800; border-top:2px solid #333; padding-top:6px; margin-top:4px; }
    .footer { font-size:11px; color:#666; margin-top:10px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="store-name">🛒 SUPERMART</div>
    <div style="font-size:11px;color:#666;">Hệ thống quản lý siêu thị</div>
  </div>

  <div class="divider"></div>

  <div class="row"><span>Mã đơn:</span><span class="bold">${order?.orderCode || "—"}</span></div>
  <div class="row"><span>Ngày:</span><span>${now}</span></div>
  <div class="row"><span>Thu ngân:</span><span>${cashier?.fullName || "—"}</span></div>
  ${customer ? `<div class="row"><span>Khách hàng:</span><span>${customer.fullName || customer.phone || "—"}</span></div>` : ""}

  <div class="divider"></div>

  <div class="row header">
    <span class="item-name">Sản phẩm</span>
    <span class="item-qty">SL</span>
    <span class="item-price">Đơn giá</span>
    <span class="item-total">T.Tiền</span>
  </div>

  ${items
    .map(
      (i) => `
  <div class="row">
    <span class="item-name">${i.name}</span>
    <span class="item-qty">${i.qty}</span>
    <span class="item-price">${fmt(i.price)}</span>
    <span class="item-total">${fmt(i.total)}</span>
  </div>`
    )
    .join("")}

  <div class="divider"></div>

  <div class="summary">
    <div class="row"><span>Tạm tính:</span><span>${fmt(subTotal)}</span></div>
    ${discount > 0 ? `<div class="row"><span>Giảm giá:</span><span style="color:#16a34a">-${fmt(discount)}</span></div>` : ""}
    <div class="row grand-total"><span>TỔNG CỘNG:</span><span>${fmt(finalAmount)}</span></div>
  </div>

  <div class="divider"></div>

  <div class="row"><span>Thanh toán:</span><span class="bold">${paymentText}</span></div>

  <div class="divider"></div>

  <div class="center footer">
    <p>Cảm ơn quý khách đã mua hàng!</p>
    <p>Hẹn gặp lại ❤️</p>
  </div>
</body>
</html>`
}

/**
 * In hóa đơn từ nội dung HTML (gọi khi user click nút In).
 * @param {string} html – HTML content từ buildInvoiceHTML
 */
export function printInvoiceHTML(html) {
  const win = window.open("", "_blank", "width=400,height=600")
  if (!win) {
    const iframe = document.createElement("iframe")
    iframe.style.cssText = "position:fixed;width:0;height:0;border:none;"
    document.body.appendChild(iframe)
    iframe.contentDocument.open()
    iframe.contentDocument.write(html)
    iframe.contentDocument.close()
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}
