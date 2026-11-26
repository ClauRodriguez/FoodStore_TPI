import { NavLink, useNavigate } from "react-router-dom";
import { useCartStore } from "@/features/cart/store/cartStore";
import { UserSummary, useAuth } from "@/features/auth";
import { useThemeStore } from "@/store/themeStore";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
      : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.cantidad, 0),
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#fffdf9]/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
  <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
    <NavLink
      to="/"
      aria-label="Food Store, ir al menú"
      className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
    >
      Foodstore<span className="text-orange-600">.</span>
    </NavLink>

    <div className="flex flex-wrap items-center gap-2">
      {user ? (
        <>
          <nav className="flex flex-wrap items-center gap-1">
            {isAdmin && (
              <NavLink className={linkClass} to="/admin/categorias">
                Categorías
              </NavLink>
            )}
            <NavLink
              className={linkClass}
              to={isAdmin ? "/admin/productos" : "/"}
            >
              Inicio
            </NavLink>
            <NavLink
              className={linkClass}
              to={isAdmin ? "/admin/pedidos" : "/mis-pedidos"}
            >
              {isAdmin ? "Pedidos" : "Mis pedidos"}
            </NavLink>
            {isAdmin && (
              <NavLink className={linkClass} to="/admin/resumen">
                Panel
              </NavLink>
            )}
            {isAdmin && (
              <NavLink className={linkClass} to="/admin/usuarios">
                Usuarios
              </NavLink>
            )}
            {!isAdmin && (
              <NavLink className={linkClass} to="/carrito">
                Carrito ({cartCount})
              </NavLink>
            )}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            aria-label="Alternar tema"
          >
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>

          <UserSummary user={user} />
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-700"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            aria-label="Alternar tema"
          >
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
          <nav className="flex items-center gap-2">
            <NavLink to="/login" className={linkClass}>
              Iniciar sesión
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Crear cuenta
            </NavLink>
          </nav>
        </>
      )}
    </div>
  </div>
</header>
  );
}
