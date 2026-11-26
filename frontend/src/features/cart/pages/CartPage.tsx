import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { EmptyState } from "@/shared/components/EmptyState";
import { useCartStore } from "../store/cartStore";

function formatPrice(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
}

export function CartPage() {
  const { user, checking } = useAuth();
  const navigate = useNavigate();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-10">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#faecd7] px-6 py-8 text-[#20291f] shadow-xl shadow-orange-950/10 dark:bg-[#2b211b] dark:text-[#fff7ed] sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full bg-orange-400/35 blur-3xl"
          />
          <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
                Foodstore · Tu pedido
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                Algo rico te está esperando.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-orange-100/70 sm:text-base">
                Todavía no agregaste productos. Explorá el menú y empezá a armar
                tu próximo pedido.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200/80 bg-white/70 p-5 dark:border-orange-900 dark:bg-[#38291f] sm:min-w-48">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-800/65 dark:text-orange-100/60">
                Tu carrito
              </p>
              <p className="mt-2 text-3xl font-extrabold">0</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-orange-100/70">
                productos por ahora
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-6 shadow-[0_16px_50px_-36px_rgba(194,92,36,0.3)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <EmptyState message="Tu carrito está vacío." />
          <div className="mt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              Explorar el menú <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#faecd7] px-6 py-8 text-[#20291f] shadow-xl shadow-orange-950/10 dark:bg-[#2b211b] dark:text-[#fff7ed] sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full bg-orange-400/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl"
        />
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-orange-500"
              />
              Foodstore · Tu pedido
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Tu carrito, a punto de salir.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-orange-100/70 sm:text-base">
              Revisá tus elecciones y asegurate de que todo esté como te gusta
              antes de confirmar.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200/80 bg-white/70 p-5 dark:border-orange-900 dark:bg-[#38291f] sm:min-w-48">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-800/65 dark:text-orange-100/60">
              Unidades
            </p>
            <p className="mt-2 text-3xl font-extrabold">{totalItems}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-orange-100/70">
              en tu pedido
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Productos en el carrito" className="space-y-4">
          {items.map((item) => (
            <article
              key={item.producto_id}
              className="flex flex-col gap-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-[0_16px_50px_-36px_rgba(194,92,36,0.3)] dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:p-5"
            >
              <div className="grid aspect-[4/3] w-full shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#fff4e5] dark:bg-slate-800 sm:aspect-square sm:w-28">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span role="img" aria-label="Comida" className="text-5xl">
                    🍽️
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {item.nombre}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {formatPrice(item.precio_unitario)} por unidad
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-orange-100 bg-[#fffaf3] dark:border-slate-700 dark:bg-slate-800">
                      <button
                        type="button"
                        disabled={item.cantidad <= 1}
                        onClick={() =>
                          cambiarCantidad(item.producto_id, item.cantidad - 1)
                        }
                        className="rounded-l-xl px-3 py-2 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
                        aria-label={`Reducir cantidad de ${item.nombre}`}
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          cambiarCantidad(item.producto_id, item.cantidad + 1)
                        }
                        className="rounded-r-xl px-3 py-2 transition hover:bg-orange-100 dark:hover:bg-slate-700"
                        aria-label={`Aumentar cantidad de ${item.nombre}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitar(item.producto_id)}
                      className="text-sm font-semibold text-rose-700 transition hover:text-rose-900 hover:underline dark:text-rose-300 dark:hover:text-rose-200"
                    >
                      Quitar
                    </button>
                  </div>

                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatPrice(item.precio_unitario * item.cantidad)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_16px_50px_-36px_rgba(194,92,36,0.3)] dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
            Tu compra
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            Resumen del pedido
          </h2>

          <div className="mt-5 flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Unidades</span>
            <span>{totalItems}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-orange-100 pt-4 dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-white">
              Total
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {formatPrice(total)}
            </span>
          </div>

          <Link
            to="/"
            className="mt-5 block rounded-xl border border-orange-200 px-4 py-2.5 text-center text-sm font-bold text-orange-800 transition hover:bg-orange-50 dark:border-orange-900 dark:text-orange-200 dark:hover:bg-orange-950/40"
          >
            Seguir comprando
          </Link>

          <button
            type="button"
            disabled={checking}
            onClick={() => {
              if (!user) {
                setShowRegistrationPrompt(true);
                return;
              }
              navigate("/checkout");
            }}
            className="mt-3 block w-full rounded-xl bg-orange-600 px-4 py-3 text-center font-bold text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
          >
            {checking ? "Verificando sesión…" : "Continuar al checkout"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            El stock y los precios se verifican al confirmar el pedido.
          </p>
        </aside>
      </div>

      {showRegistrationPrompt && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-prompt-title"
            className="relative w-full max-w-md rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8"
          >
            <button
              type="button"
              aria-label="Cerrar aviso"
              onClick={() => setShowRegistrationPrompt(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-2xl leading-none text-slate-500 transition hover:bg-orange-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <span aria-hidden="true">×</span>
            </button>
            <p className="pr-10 text-xs font-bold uppercase tracking-[0.16em] text-orange-700 dark:text-orange-300">
              Foodstore · Checkout
            </p>
            <h2
              id="registration-prompt-title"
              className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              ¡Ya casi está tu pedido!
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Para terminar la compra, ingresá con tu usuario o creá una cuenta
              en segundos. Tu carrito permanecera guardado.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                Registrarme
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-xl border border-orange-200 px-4 py-3 text-sm font-bold text-orange-800 transition hover:bg-orange-50 dark:border-orange-900 dark:text-orange-200 dark:hover:bg-orange-950/40"
              >
                Iniciar sesión
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
