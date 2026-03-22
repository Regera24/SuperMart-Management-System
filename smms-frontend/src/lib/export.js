import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function exportToExcel(data, columns, filename = "export", sheetName = "Data") {
  const rows = data.map((row) =>
    columns.reduce((obj, col) => {
      obj[col.label] = col.format ? col.format(row[col.key], row) : row[col.key]
      return obj
    }, {})
  )
  const ws = XLSX.utils.json_to_sheet(rows)
  const colWidths = columns.map((col) => ({
    wch: Math.max(col.label.length + 2, ...data.map((row) => String(col.format ? col.format(row[col.key], row) : row[col.key] || "").length + 2))
  }))
  ws["!cols"] = colWidths
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, `${filename}_${fmtDate()}.xlsx`)
}

export function exportToPdf(data, columns, filename = "export", options = {}) {
  const { title = "Báo cáo SMMS", orientation = "landscape", subtitle } = options
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" })
  doc.setFontSize(18); doc.setTextColor(16, 185, 129); doc.text("SMMS", 14, 15)
  doc.setFontSize(9); doc.setTextColor(100); doc.text("SuperMart Management System", 14, 20)
  doc.setFontSize(14); doc.setTextColor(30); doc.text(title, 14, 32)
  if (subtitle) { doc.setFontSize(10); doc.setTextColor(100); doc.text(subtitle, 14, 38) }
  doc.setFontSize(8); doc.setTextColor(150)
  doc.text(`Xuất lúc: ${new Date().toLocaleString("vi-VN")}`, doc.internal.pageSize.width - 14, 15, { align: "right" })
  const headers = columns.map((col) => col.label)
  const rows = data.map((row) => columns.map((col) => col.format ? col.format(row[col.key], row) : String(row[col.key] ?? "")))
  autoTable(doc, {
    head: [headers], body: rows, startY: subtitle ? 44 : 38,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150)
    doc.text(`Trang ${i}/${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" })
  }
  doc.save(`${filename}_${fmtDate()}.pdf`)
}

function fmtDate() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`
}
