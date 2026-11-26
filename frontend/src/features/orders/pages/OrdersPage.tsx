import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "@/shared/api/api";
import { useAuth } from "@/features/auth";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import { useNotificationStore } from "@/store/notificationStore";

type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";

type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  items: DetallePedido[];
}

interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const ESTADO_COLORES: Record<EstadoPedido, { badge: string; dot: string }> = {
  PENDIENTE: {
    badge:
      "border-[#e9e4d9] bg-[#f8f6f0] text-[#625b4f] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
    dot: "bg-slate-500",
  },
  EN_PREPARACION: {
    badge:
      "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
    dot: "bg-orange-500",
  },
  ENTREGADO: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  CANCELADO: {
    badge:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
    dot: "bg-rose-500",
  },
};

const PAGE_SIZE = 10;

function formatPrice(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
}

export function OrdersPage() {
  const [skip, setSkip] = useState(0);
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const query = useQuery({
    queryKey: ["pedidos", skip],
    queryFn: async () =>
      (
        await api.get<PedidosPaginados>("/pedidos", {
          params: { skip, limit: PAGE_SIZE },
        })
      ).data,
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: number) =>
      (await api.patch<Pedido>(`/pedidos/${orderId}/cancelar`)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-summary"] }),
      ]);
      showNotification("Pedido cancelado");
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  });

  const changeOrderState = useMutation({
    mutationFn: async ({
      orderId,
      estado,
    }: {
      orderId: number;
      estado: EstadoPedido;
    }) =>
      (await api.patch<Pedido>(`/pedidos/${orderId}/estado`, { estado })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-summary"] }),
      ]);
      showNotification("Estado del pedido actualizado");
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  });

  if (query.isPending) return <LoadingState message="Cargando pedidos…" />;

  if (query.isError) {
    return (
      <ErrorState
        message={apiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const orders = query.data.items;
  const totalPages = Math.max(1, Math.ceil(query.data.total / PAGE_SIZE));
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const heroClassName = isAdmin
    ? "bg-[#183a31] text-white shadow-emerald-950/10"
    : "bg-[#faecd7] text-[#20291f] shadow-orange-950/10 dark:bg-[#2b211b] dark:text-[#fff7ed]";
  const heroDecorationClassName = isAdmin
    ? "bg-orange-400/20"
    : "bg-orange-400/35";
  const heroSecondaryDecorationClassName = isAdmin
    ? "bg-emerald-300/10"
    : "bg-amber-500/20";
  const heroEyebrowClassName = isAdmin
    ? "border-white/15 bg-white/10 text-orange-200"
    : "border-orange-200 bg-white/60 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200";
  const heroDescriptionClassName = isAdmin
    ? "text-emerald-50/75"
    : "text-slate-600 dark:text-orange-100/70";
  const summaryPanelClassName = isAdmin
    ? "border-white/15 bg-white/[0.08]"
    : "border-orange-200/80 bg-white/70 dark:border-orange-900 dark:bg-[#38291f]";
  const orderCardClassName = isAdmin
    ? "border-[#e9e4d9] shadow-[0_16px_50px_-36px_rgba(24,58,49,0.35)]"
    : "border-orange-100 shadow-[0_16px_50px_-36px_rgba(194,92,36,0.3)] dark:border-slate-800";
  const orderHeaderClassName = isAdmin
    ? "border-[#eee9df] bg-[#fdfcf9] dark:border-slate-800 dark:bg-slate-900"
    : "border-orange-100 bg-[#fffaf3] dark:border-slate-800 dark:bg-slate-900";
  const orderNumberClassName = isAdmin
    ? "bg-[#183a31] dark:bg-emerald-800"
    : "bg-orange-600 dark:bg-orange-700";
  const detailPanelClassName = isAdmin
    ? "bg-[#f8f6f0] dark:bg-slate-800/70"
    : "bg-[#fff8ee] dark:bg-slate-800/70";
  const contentBorderClassName = isAdmin
    ? "border-[#eee9df] dark:border-slate-800"
    : "border-orange-100 dark:border-slate-800";
  const nextButtonClassName = isAdmin
    ? "bg-[#183a31] hover:bg-[#245345] dark:bg-emerald-800 dark:hover:bg-emerald-700"
    : "bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600";

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-10">
      <section
        className={`relative isolate overflow-hidden rounded-[2rem] px-6 py-8 shadow-xl sm:px-10 sm:py-10 ${heroClassName}`}
      >
        <div
          aria-hidden="true"
          className={`absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full blur-3xl ${heroDecorationClassName}`}
        />
        <div
          aria-hidden="true"
          className={`absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full blur-3xl ${heroSecondaryDecorationClassName}`}
        />
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-2xl">
            <p
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${heroEyebrowClassName}`}
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-orange-300" />
              {isAdmin ? "Foodstore · Operaciones" : "Foodstore · Tu cuenta"}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              {isAdmin ? "El ritmo de cada pedido." : "Tus momentos Foodstore."}
            </h1>
            <p
              className={`mt-4 max-w-xl text-sm leading-6 sm:text-base ${heroDescriptionClassName}`}
            >
              {isAdmin
                ? "Revisá el estado de cada orden y acompañá su recorrido hasta la entrega."
                : "Seguí tus pedidos y encontrá el detalle de cada elección."}
            </p>
          </div>
          <div
            className={`rounded-2xl border p-5 backdrop-blur-sm sm:min-w-48 ${summaryPanelClassName}`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                isAdmin
                  ? "text-emerald-50/60"
                  : "text-orange-800/65 dark:text-orange-100/60"
              }`}
            >
              Pedidos en total
            </p>
            <p className="mt-2 text-3xl font-extrabold">{query.data.total}</p>
            <p
              className={`mt-1 text-sm ${
                isAdmin
                  ? "text-emerald-50/70"
                  : "text-slate-600 dark:text-orange-100/70"
              }`}
            >
              {isAdmin ? "En todos los estados" : "En tu historial"}
            </p>
          </div>
        </div>
      </section>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState message="Todavía no hay pedidos." />
        </div>
      ) : (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
                Actividad reciente
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {isAdmin ? "Pedidos" : "Mis pedidos"}
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Página {currentPage} de {totalPages}
            </p>
          </div>
          <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className={`overflow-hidden rounded-3xl border bg-white dark:bg-slate-900 ${orderCardClassName}`}
            >
              <div
                className={`flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-7 ${orderHeaderClassName}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold text-white ${orderNumberClassName}`}
                  >
                    #{order.id}
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Pedido #{order.id}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(order.created_at).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${ESTADO_COLORES[order.estado].badge}`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${ESTADO_COLORES[order.estado].dot}`}
                  />
                  {order.estado.replace("_", " ")}
                </span>
              </div>

              <div className="grid gap-3 px-5 pt-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-3">
                <div className={`rounded-2xl p-4 ${detailPanelClassName}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Forma de pago
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {order.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                  </p>
                </div>
                <div className={`rounded-2xl p-4 ${detailPanelClassName}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Dirección de entrega
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {order.direccion_entrega}
                  </p>
                </div>
                {order.notas && (
                  <div className={`rounded-2xl p-4 ${detailPanelClassName}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Notas
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {order.notas}
                    </p>
                  </div>
                )}
              </div>

              <div
                className={`mx-5 mt-4 rounded-2xl border px-4 sm:mx-7 ${contentBorderClassName}`}
              >
                <ul
                  className={`divide-y ${
                    isAdmin
                      ? "divide-[#f1eee7] dark:divide-slate-800"
                      : "divide-orange-100 dark:divide-slate-800"
                  }`}
                >
                  {order.items.map((item) => (
                    <li
                      key={item.producto_id}
                      className="flex justify-between gap-4 py-3 text-sm"
                    >
                      <span className="text-slate-700 dark:text-slate-200">
                        {item.nombre_producto} <span className="text-slate-400">× {item.cantidad}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-slate-800 dark:text-slate-100">
                        {formatPrice(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`mt-4 flex flex-wrap items-center justify-between gap-4 border-t px-5 py-5 sm:px-7 ${contentBorderClassName}`}
              >
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Total del pedido
                  <span className="ml-3 text-xl font-extrabold text-slate-900 dark:text-white">
                    {formatPrice(order.total)}
                  </span>
                </p>
                {isAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    {TRANSICIONES_VALIDAS[order.estado].map((estado) => {
                      const label =
                        estado === "EN_PREPARACION"
                          ? "Pasar a preparación"
                          : estado === "ENTREGADO"
                            ? "Marcar entregado"
                            : "Cancelar pedido";

                      return (
                        <button
                          key={estado}
                          type="button"
                          disabled={changeOrderState.isPending}
                          onClick={() => {
                            if (
                              estado !== "CANCELADO" ||
                              confirm(`¿Cancelar el pedido #${order.id}?`)
                            ) {
                              changeOrderState.mutate({
                                orderId: order.id,
                                estado,
                              });
                            }
                          }}
                          className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            estado === "CANCELADO"
                              ? "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950"
                              : "bg-[#183a31] text-white hover:bg-[#245345] dark:bg-emerald-800 dark:hover:bg-emerald-700"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  order.estado === "PENDIENTE" && (
                    <button
                      type="button"
                      disabled={cancelOrder.isPending}
                      onClick={() => {
                        if (confirm(`¿Cancelar el pedido #${order.id}?`)) {
                          cancelOrder.mutate(order.id);
                        }
                      }}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950"
                    >
                      Cancelar pedido
                    </button>
                  )
                )}
              </div>
            </article>
          ))}
          </div>
        </section>
      )}

      {query.data.total > 0 && (
        <div
          className={`mt-5 flex flex-col gap-3 rounded-2xl border bg-white px-5 py-4 text-sm dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between ${
            isAdmin
              ? "border-[#e9e4d9] dark:border-slate-800"
              : "border-orange-100 dark:border-slate-800"
          }`}
        >
          <span className="font-medium text-slate-500 dark:text-slate-400">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={skip === 0}
              onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
              className="rounded-xl border border-[#e9e4d9] bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-700 dark:hover:text-orange-200"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={skip + PAGE_SIZE >= query.data.total}
              onClick={() => setSkip(skip + PAGE_SIZE)}
              className={`rounded-xl px-4 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${nextButtonClassName}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl border border-[#e9e4d9] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-orange-700 dark:hover:text-orange-200"
      >
        Volver al menú
      </Link>
    </main>
  );
}
