import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

function formatPrice(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
}

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <aside className="rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_16px_50px_-36px_rgba(194,92,36,0.3)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
            Tu compra
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
            Tu carrito
          </h2>
        </div>
        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800 dark:bg-orange-950 dark:text-orange-200">
          {totalItems}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Todavía no agregaste productos.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li
                key={item.producto_id}
                className="border-b border-orange-100 pb-4 last:border-b-0 dark:border-slate-700"
              >
                <div className="flex gap-3">
                  <div
                    className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#fff4e5] dark:bg-slate-800"
                  >
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span role="img" aria-label="Comida">
                        🍽️
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {item.nombre}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {formatPrice(item.precio_unitario)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={item.cantidad <= 1}
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad - 1)
                      }
                      className="rounded-lg border border-orange-200 px-2 py-1 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                      aria-label={`Reducir cantidad de ${item.nombre}`}
                    >
                      −
                    </button>
                    <span className="min-w-5 text-center text-sm">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad + 1)
                      }
                      className="rounded-lg border border-orange-200 px-2 py-1 transition hover:bg-orange-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => quitar(item.producto_id)}
                      className="ml-1 text-xs font-semibold text-rose-700 hover:underline dark:text-rose-300"
                    >
                      Quitar
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatPrice(item.precio_unitario * item.cantidad)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="mt-2 flex justify-between border-t border-orange-100 pt-3 dark:border-slate-700">
            <span className="font-bold text-slate-900 dark:text-white">
              Total
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatPrice(total)}
            </span>
          </div>

          <Link
            to="/carrito"
            className="mt-4 block rounded-xl bg-orange-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-orange-700"
          >
            Ver carrito <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Revisá tu pedido antes de confirmar.
          </p>
        </>
      )}
    </aside>
  );
}
