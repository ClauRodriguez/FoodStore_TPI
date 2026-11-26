import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Skeleton } from "@/shared/components/Skeleton";
import { useProducts } from "../hooks/useProducts";

const PAGE_SIZE = 20;

export function CatalogoPage() {
  const { isAdmin } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [availability, setAvailability] = useState<boolean | undefined>();
  const {
    products,
    total,
    isLoading,
    error: queryError,
    refetch,
  } = useProducts({
    skip: pageIndex * PAGE_SIZE,
    limit: PAGE_SIZE,
    search,
    categoria_id: categoryId,
    disponible: availability,
  });
  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories();
  const agregarAlCarrito = useCartStore((state) => state.agregar);
  const cartItems = useCartStore((state) => state.items);
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(pageCount - 1);
    }
  }, [pageCount, pageIndex]);

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
              Foodstore · Tu menú
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Tu próximo antojo, a un pedido de distancia.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-orange-100/70 sm:text-base">
              Elegí tus favoritos y disfrutá algo rico. Nosotros nos encargamos
              del pedido.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200/80 bg-white/70 p-5 backdrop-blur-sm dark:border-orange-900 dark:bg-[#38291f] sm:min-w-48">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-800/65 dark:text-orange-100/60">
              En el menú
            </p>
            <p className="mt-2 text-3xl font-extrabold">{total}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-orange-100/70">
              opciones para elegir
            </p>
            <a
              href="#menu"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Explorar el menú <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
            Tu menú
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            ¿Qué se te antoja hoy?
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Elegí tus favoritos y armá tu pedido.
          </p>
        </div>

        <div
          id="menu"
          className="mb-5 space-y-5 rounded-3xl border border-[#e9e4d9] bg-white p-5 shadow-[0_16px_50px_-36px_rgba(24,58,49,0.35)] dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Buscar
              <input
                type="search"
                value={search}
                placeholder="Buscar un producto..."
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageIndex(0);
                }}
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Disponibilidad
              <select
                value={availability === undefined ? "" : String(availability)}
                onChange={(event) => {
                  const value = event.target.value;
                  setAvailability(value === "" ? undefined : value === "true");
                  setPageIndex(0);
                }}
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
              >
                <option value="">Todos</option>
                <option value="true">Disponible</option>
                <option value="false">No disponible</option>
              </select>
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Categorías
            </p>
            {isLoadingCategories ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cargando categorías…
              </p>
            ) : categoriesError ? (
              <p className="text-sm text-red-700 dark:text-red-300">
                {categoriesError}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={categoryId === undefined}
                  onClick={() => {
                    setCategoryId(undefined);
                    setPageIndex(0);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                    categoryId === undefined
                      ? "border-[#183a31] bg-[#183a31] text-white dark:border-emerald-700 dark:bg-emerald-800"
                      : "border-[#e9e4d9] bg-white text-slate-700 hover:border-orange-400 hover:text-orange-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  Todas
                </button>
                {categories
                  .filter((category) => category.activo)
                  .map((category) => {
                    const isSelected = categoryId === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setCategoryId(category.id);
                          setPageIndex(0);
                        }}
                        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                          isSelected
                            ? "border-[#183a31] bg-[#183a31] text-white dark:border-emerald-700 dark:bg-emerald-800"
                            : "border-[#e9e4d9] bg-white text-slate-700 hover:border-orange-400 hover:text-orange-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        }`}
                      >
                        {category.nombre}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div
            aria-busy="true"
            className={`grid items-start gap-6 ${
              isAdmin ? "" : "lg:grid-cols-[minmax(0,1fr)_20rem]"
            }`}
          >
            <section className="min-w-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <article
                    key={index}
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <Skeleton className="aspect-[4/3] shrink-0 rounded-none" />
                    <div className="flex flex-1 flex-col p-4">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="mt-2 h-6 w-3/4" />
                      <Skeleton className="mt-2 h-10 w-full" />
                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <Skeleton className="h-5 w-20" />
                        {!isAdmin && (
                          <Skeleton className="h-9 w-24 rounded-lg" />
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <p role="status" className="sr-only">
                Cargando menú…
              </p>
            </section>
            {!isAdmin && (
              <div className="lg:sticky lg:top-24">
                <CartSummary />
              </div>
            )}
          </div>
        ) : queryError ? (
          <ErrorState message={queryError} onRetry={() => void refetch()} />
        ) : products.length === 0 ? (
          <EmptyState
            message={
              search.trim() ||
              categoryId !== undefined ||
              availability !== undefined
                ? "No hay productos que coincidan con los filtros."
                : "No hay productos cargados."
            }
          />
        ) : (
          <div
            className={`grid items-start gap-6 ${
              isAdmin ? "" : "lg:grid-cols-[minmax(0,1fr)_20rem]"
            }`}
          >
            <section className="min-w-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const quantityInCart =
                    cartItems.find((item) => item.producto_id === product.id)
                      ?.cantidad ?? 0;
                  const unavailable = !product.activo || !product.disponible;
                  const outOfStock = product.stock <= 0;
                  const stockLimitReached = quantityInCart >= product.stock;
                  const canAddToCart =
                    !unavailable && !outOfStock && !stockLimitReached;

                  return (
                    <article
                      key={product.id}
                      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="aspect-[4/3] shrink-0 overflow-hidden bg-[#f5efe5] dark:bg-slate-800">
                        {product.imagen_url ? (
                          <img
                            src={product.imagen_url}
                            alt={product.nombre}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="grid h-full place-items-center text-6xl"
                            role="img"
                            aria-label="Comida"
                          >
                            🍽️
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          {product.categoria.nombre}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {product.nombre}
                        </h3>
                        <p className="mt-1 min-h-10 text-sm text-slate-600 dark:text-slate-300">
                          {product.descripcion ||
                            "Una opción rica para disfrutar."}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {product.precio_base.toLocaleString("es-AR", {
                              style: "currency",
                              currency: "ARS",
                            })}
                          </span>
                          {!isAdmin && (
                            <button
                              type="button"
                              disabled={!canAddToCart}
                              onClick={() => {
                                agregarAlCarrito(product);
                                showNotification(
                                  "Producto agregado al carrito",
                                );
                              }}
                              className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                              {unavailable
                                ? "No disponible"
                                : outOfStock
                                  ? "Sin stock"
                                  : stockLimitReached
                                    ? "Stock máximo"
                                    : "+ Agregar"}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Mostrando {pageIndex * PAGE_SIZE + 1}–
                  {Math.min((pageIndex + 1) * PAGE_SIZE, total)} de {total}{" "}
                  productos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pageIndex === 0}
                    onClick={() => setPageIndex((page) => page - 1)}
                    className="rounded-xl border border-[#e9e4d9] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-orange-700 dark:hover:text-orange-200"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Página {pageIndex + 1} de {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={pageIndex >= pageCount - 1}
                    onClick={() => setPageIndex((page) => page + 1)}
                    className="rounded-xl border border-[#e9e4d9] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-orange-700 dark:hover:text-orange-200"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </section>
            {!isAdmin && (
              <div className="lg:sticky lg:top-24">
                <CartSummary />
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
