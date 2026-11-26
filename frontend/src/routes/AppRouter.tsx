import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  useAuth,
  AdminUsersPage,
  LoginPage,
  RegisterPage,
} from "@/features/auth";
import { CategoriesPage } from "@/features/categories";
import {
  AdminProductsPage,
  CatalogoPage,
} from "@/features/products";
import { Navbar } from "@/shared/components/Navbar";
import { UnauthorizedPage } from "@/shared/components/UnauthorizedPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { CartPage } from "@/features/cart/pages/CartPage";
import { CheckoutPage } from "@/features/cart/pages/CheckoutPage";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { AdminOrdersPage } from "@/features/orders/pages/AdminOrdersPage";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";

export function AppRouter() {
  const { user, isAdmin } = useAuth();
    const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9] dark:bg-slate-950">
      {!isAuthPage && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route path="/" element={<CatalogoPage />} />
          <Route path="/products" element={<Navigate to="/" replace />} />
          <Route path="/productos" element={<Navigate to="/" replace />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/cart" element={<Navigate to="/carrito" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<OrdersPage />} />
            <Route
              path="/orders"
              element={
                <Navigate
                  to={isAdmin ? "/admin/pedidos" : "/mis-pedidos"}
                  replace
                />
              }
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/categorias"
              element={<CategoriesPage />}
            />
            <Route
              path="/categories"
              element={<Navigate to="/admin/categorias" replace />}
            />
            <Route
              path="/categorias"
              element={<Navigate to="/admin/categorias" replace />}
            />
            <Route path="/admin/productos" element={<AdminProductsPage />} />
            <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route
              path="/admin/users"
              element={<Navigate to="/admin/usuarios" replace />}
            />
            <Route path="/admin/resumen" element={<AdminDashboardPage />} />
            <Route
              path="/admin"
              element={<Navigate to="/admin/resumen" replace />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isAuthPage && (
      <footer className="border-t border-slate-200 bg-[#1d281f] text-white dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold">
              foodstore<span className="text-orange-500">.</span>
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Donde el hambre se convierte en felicidad.
            </p>
          </div>
          <p className="text-xs text-slate-300">
            © {new Date().getFullYear()} Food Store
          </p>
        </div>
      </footer>
      )}
    </div>
  );
}
