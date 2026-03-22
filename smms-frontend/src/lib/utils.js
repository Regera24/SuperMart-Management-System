import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  const value = Number(amount)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(isNaN(value) ? 0 : value)
}

export function formatDate(date) {
  if (!date) return ""
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatNumber(num) {
  const value = Number(num)
  return new Intl.NumberFormat('vi-VN').format(isNaN(value) ? 0 : value)
}

/** Safe number helper – returns 0 for any non-numeric input */
export function safeNum(v) {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}
