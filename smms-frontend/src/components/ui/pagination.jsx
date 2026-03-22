import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/**
 * Reusable pagination component with page size selector and smart page window.
 *
 * Props:
 *  - page: current page index (0-based)
 *  - totalPages: total number of pages
 *  - totalElements: total records count
 *  - pageSize: current items per page
 *  - onPageChange: (page) => void
 *  - onPageSizeChange: (size) => void
 *  - label: item name for display (default: "mục")
 */
export default function Pagination({ page, totalPages, totalElements, pageSize, onPageChange, onPageSizeChange, label = "mục" }) {
  const safeTotal = Math.max(totalPages, 1)

  // Smart page window — show up to 5 pages centered around current page
  const getPageNumbers = () => {
    const maxVisible = 5
    if (safeTotal <= maxVisible) return Array.from({ length: safeTotal }, (_, i) => i)
    let start = Math.max(0, page - Math.floor(maxVisible / 2))
    let end = start + maxVisible
    if (end > safeTotal) { end = safeTotal; start = end - maxVisible }
    return Array.from({ length: end - start }, (_, i) => start + i)
  }

  const pages = getPageNumbers()
  const from = totalElements === 0 ? 0 : page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className="flex items-center justify-between border-t p-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Hiển thị</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">/ trang</span>
        </div>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {from}–{to} trong {totalElements} {label}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* First page */}
        <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:flex" disabled={page === 0} onClick={() => onPageChange(0)}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        {/* Previous */}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {/* Page numbers */}
        {pages[0] > 0 && <span className="text-xs text-muted-foreground px-1">…</span>}
        {pages.map(i => (
          <Button key={i} variant={page === i ? "default" : "outline"} size="sm" className="h-8 w-8 text-xs" onClick={() => onPageChange(i)}>
            {i + 1}
          </Button>
        ))}
        {pages[pages.length - 1] < safeTotal - 1 && <span className="text-xs text-muted-foreground px-1">…</span>}
        {/* Next */}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= safeTotal - 1} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        {/* Last page */}
        <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:flex" disabled={page >= safeTotal - 1} onClick={() => onPageChange(safeTotal - 1)}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
