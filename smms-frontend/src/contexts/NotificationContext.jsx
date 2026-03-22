import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import * as notificationApi from "@/api/notificationApi"

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    const fetchNotifications = async () => {
      try {
        const result = await notificationApi.getNotifications(user.id, { page: 0, size: 20 })
        if (result.content?.length) {
          setNotifications(result.content)
          setUnreadCount(result.content.filter((n) => !n.read).length)
        }
      } catch { /* keep existing */ }
    }
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [user])

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const addNotification = useCallback((notification) => {
    const newNotif = { id: Date.now().toString(), createdAt: new Date().toISOString(), read: false, ...notification }
    setNotifications((prev) => [newNotif, ...prev])
    setUnreadCount((prev) => prev + 1)
    return newNotif
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider")
  return ctx
}
