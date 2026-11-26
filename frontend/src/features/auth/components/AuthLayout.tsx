import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useThemeStore } from "@/store/themeStore";

type AuthPage = "login" | "register";

interface AuthLayoutProps {
  page: AuthPage;
  children: ReactNode;
}

export function AuthLayout({ page, children }: AuthLayoutProps) {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { products } = useProducts({ limit: 20 });
  const heroImage = products.find((product) => product.imagen_url)?.imagen_url;
  const isLoginPage = page === "login";

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9] text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <NavLink
            to="/login"
            aria-label="Food Store"
            className="text-2xl font-extrabold tracking-tight"
          >
            Foodstore<span className="text-orange-600">.</span>
          </NavLink>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Alternar tema"
            >
              {darkMode ? "☀️ Claro" : "◐ Oscuro"}
            </button>
            <NavLink
              to={isLoginPage ? "/register" : "/login"}
              className="rounded-xl bg-[#fff0e8] px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-[#ffe4d5] dark:bg-orange-950/40 dark:text-orange-300"
            >
              {isLoginPage ? "Crear cuenta" : "Iniciar sesión"}
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-5 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <section className="rounded-3xl bg-[#faecd7] p-7 sm:p-10 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-900 dark:text-emerald-300">
            <span aria-hidden="true">●</span> Buena comida. Sin vueltas.
          </p>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#20291f] sm:text-5xl dark:text-white">
            El buen sabor
            <br />
            empieza acá.
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Tus favoritos, recién hechos.
            <br />
            Tu próximo antojo está a un paso.
          </p>

          <div className="relative mt-8 grid aspect-[16/9] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-200 via-orange-300 to-orange-500">
            {heroImage ? (
              <img
                src={heroImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span role="img" aria-label="Hamburguesa" className="text-8xl">
                🍔
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
            <span>✓ Hecho al momento</span>
            <span aria-hidden="true">·</span>
            <span>Hecho para vos</span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md self-start pt-7 sm:pt-50">
          <nav
            aria-label="Acceso a la cuenta"
            className="grid grid-cols-2 rounded-xl bg-[#edf0e8] p-1 dark:bg-slate-800"
          >
            {isLoginPage ? (
              <>
                <span
                  aria-current="page"
                  className="rounded-lg bg-white px-3 py-2.5 text-center text-sm font-bold shadow-sm dark:bg-slate-700"
                >
                  Iniciar sesión
                </span>
                <NavLink
                  to="/register"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Crear cuenta
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Iniciar sesión
                </NavLink>
                <span
                  aria-current="page"
                  className="rounded-lg bg-white px-3 py-2.5 text-center text-sm font-bold shadow-sm dark:bg-slate-700"
                >
                  Crear cuenta
                </span>
              </>
            )}
          </nav>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
            {isLoginPage ? "¡Qué bueno verte!" : "Creá tu cuenta"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isLoginPage
              ? "Ingresá a tu cuenta y encontrá eso que tanto te gusta."
              : "Registrate y preparate para disfrutar tus favoritos."}
          </p>

          <div className="mt-6">{children}</div>

          <div className="mt-6 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span>Acceso seguro</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <span aria-hidden="true">♙</span> Tu cuenta y tus datos, protegidos.
          </p>
        </section>
      </main>
    </div>
  );
}