import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import AdminLayout from "@/components/layout/AdminLayout"
import LoginPage from "@/pages/auth/LoginPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import POSPage from "@/pages/pos/POSPage"
import ProductsPage from "@/pages/products/ProductsPage"
import CategoriesPage from "@/pages/categories/CategoriesPage"
import OrdersPage from "@/pages/orders/OrdersPage"
import InventoryPage from "@/pages/inventory/InventoryPage"
import CustomersPage from "@/pages/customers/CustomersPage"
import StaffPage from "@/pages/staff/StaffPage"
import UsersPage from "@/pages/users/UsersPage"
import ReportsPage from "@/pages/reports/ReportsPage"
import NotificationsPage from "@/pages/notifications/NotificationsPage"
import SettingsPage from "@/pages/settings/SettingsPage"

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, hasAnyRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !hasAnyRole(...roles)) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      
      {/* POS - full screen, no admin layout */}
      <Route path="/pos" element={<ProtectedRoute roles={["ADMIN","MANAGER","CASHIER"]}><POSPage /></ProtectedRoute>} />

      {/* Admin layout routes */}
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<ProtectedRoute roles={["ADMIN","MANAGER"]}><CategoriesPage /></ProtectedRoute>} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<ProtectedRoute roles={["ADMIN","MANAGER"]}><InventoryPage /></ProtectedRoute>} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/staff" element={<ProtectedRoute roles={["ADMIN"]}><StaffPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={["ADMIN"]}><UsersPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={["ADMIN","MANAGER"]}><ReportsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <AppRoutes />
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
