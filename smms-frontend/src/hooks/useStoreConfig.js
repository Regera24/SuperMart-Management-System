import { useState, useEffect, useCallback } from "react"
import defaultConfig from "@/config/storeConfig"

const STORAGE_KEY = "smms-store-config"

/**
 * Hook quản lý cấu hình cửa hàng.
 * - Đọc từ localStorage, fallback về default config
 * - saveConfig(newConfig) → ghi vào localStorage
 * - resetConfig() → xóa localStorage, trở về default
 */
export default function useStoreConfig() {
  const [config, setConfig] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with default to ensure new fields are always present
        return { ...defaultConfig, ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return { ...defaultConfig }
  })

  const saveConfig = useCallback((newConfig) => {
    const merged = { ...defaultConfig, ...newConfig }
    setConfig(merged)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  }, [])

  const resetConfig = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setConfig({ ...defaultConfig })
  }, [])

  return { config, saveConfig, resetConfig, defaultConfig }
}
