import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  flexRender,
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useSearchParams } from 'react-router-dom'
import { api, apiErrorMessage } from '@/shared/api/api'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { useNotificationStore } from '@/store/notificationStore'

type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  items: DetallePedido[]
}

interface PedidosPaginados {
  total: number
  items: Pedido[]
}

const PAGE_SIZE = 10
const ESTADOS: EstadoPedido[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'ENTREGADO',
  'CANCELADO',
]

const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

const ESTADO_COLORES: Record<EstadoPedido, string> = {
  PENDIENTE:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  EN_PREPARACION:
    'bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200',
  ENTREGADO:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  CANCELADO:
    'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
}

function isEstadoPedido(value: string | null): value is EstadoPedido {
  return value !== null && ESTADOS.includes(value as EstadoPedido)
}

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [skip, setSkip] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )
  const estadoParam = searchParams.get('estado')
  const estado = isEstadoPedido(estadoParam) ? estadoParam : undefined

  const query = useQuery({
    queryKey: ['pedidos', 'admin', skip, estado],
    queryFn: async () =>
      (
        await api.get<PedidosPaginados>('/pedidos', {
          params: { skip, limit: PAGE_SIZE, estado },
        })
      ).data,
  })

  const changeOrderState = useMutation({
    mutationFn: async ({
      orderId,
      newState,
    }: {
      orderId: number
      newState: EstadoPedido
    }) =>
      (
        await api.patch<Pedido>(`/pedidos/${orderId}/estado`, {
          estado: newState,
        })
      ).data,
    onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
          queryClient.invalidateQueries({ queryKey: ['productos'] }),
          queryClient.invalidateQueries({ queryKey: ['admin-order-summary'] }),
        ])
      showNotification('Estado del pedido actualizado')
    },
    onError: (error) => showNotification(apiErrorMessage(error)),
  })

  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: 'id',
      header: 'Pedido',
      cell: ({ row }) => (
        <span className="font-extrabold text-slate-900 dark:text-white">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'usuario_id',
      header: 'Cliente',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Cuenta #{row.original.usuario_id}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
          {new Date(row.original.created_at).toLocaleString('es-AR')}
        </span>
      ),
    },
    {
      id: 'items',
      header: 'Detalle',
      accessorFn: (order) => order.items.map((item) => item.nombre_producto).join(' '),
      cell: ({ row }) => (
        <div className="max-w-64">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {row.original.items.length}{' '}
            {row.original.items.length === 1 ? 'producto' : 'productos'}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {row.original.items
              .map((item) => `${item.nombre_producto} × ${item.cantidad}`)
              .join(', ')}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-bold text-slate-900 dark:text-white">
          {formatPrice(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${ESTADO_COLORES[row.original.estado]}`}
        >
          {row.original.estado.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex min-w-48 flex-wrap gap-2">
            {TRANSICIONES_VALIDAS[order.estado].map((newState) => {
              const label =
                newState === 'EN_PREPARACION'
                  ? 'Preparar'
                  : newState === 'ENTREGADO'
                    ? 'Entregado'
                    : 'Cancelar'

              return (
                <button
                  key={newState}
                  type="button"
                  disabled={changeOrderState.isPending}
                  onClick={() => {
                    if (
                      newState !== 'CANCELADO' ||
                      confirm(`¿Cancelar el pedido #${order.id}?`)
                    ) {
                      changeOrderState.mutate({
                        orderId: order.id,
                        newState,
                      })
                    }
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    newState === 'CANCELADO'
                      ? 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950'
                      : 'bg-[#183a31] text-white hover:bg-[#245345] dark:bg-emerald-800 dark:hover:bg-emerald-700'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: query.data?.items ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (query.isPending) return <LoadingState message="Cargando pedidos…" />
  if (query.isError) {
    return (
      <ErrorState
        message={apiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const total = query.data.total
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1

  const updateStatusFilter = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (isEstadoPedido(value)) nextParams.set('estado', value)
    else nextParams.delete('estado')
    setSkip(0)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#183a31] px-6 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl"
        />
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-orange-300"
              />
              Foodstore · Operaciones
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Cada pedido, bajo control.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
              Filtrá por estado y actualizá el recorrido de cada pedido hasta la
              entrega.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm sm:min-w-48">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-50/60">
              Pedidos encontrados
            </p>
            <p className="mt-2 text-3xl font-extrabold">{total}</p>
            <p className="mt-1 text-sm text-emerald-50/70">
              {estado ? estado.replace('_', ' ') : 'Todos los estados'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
              Seguimiento
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Administración de pedidos
            </h2>
          </div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Filtrar por estado
            <select
              value={estado ?? ''}
              onChange={(event) => updateStatusFilter(event.target.value)}
              className="mt-1.5 min-w-52 rounded-xl border border-[#e5dfd1] bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((orderState) => (
                <option key={orderState} value={orderState}>
                  {orderState.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>

        {table.getRowModel().rows.length === 0 ? (
          <EmptyState
            message={
              estado
                ? `No hay pedidos con estado ${estado.replace('_', ' ')}.`
                : 'Todavía no hay pedidos.'
            }
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#e9e4d9] bg-white shadow-[0_16px_50px_-36px_rgba(24,58,49,0.35)] dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] divide-y divide-[#eee9df] dark:divide-slate-800">
                <thead className="bg-[#f8f6f0] dark:bg-slate-800/80">
                  {table.getHeaderGroups().map((group) => (
                    <tr key={group.id}>
                      {group.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300"
                        >
                          {header.column.getCanSort() ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="inline-flex items-center gap-1.5 transition hover:text-orange-700 dark:hover:text-orange-300"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <span
                                aria-hidden="true"
                                className="text-orange-600"
                              >
                                {{ asc: '↑', desc: '↓' }[
                                  header.column.getIsSorted() as string
                                ] ?? '↕'}
                              </span>
                            </button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-[#f1eee7] dark:divide-slate-800">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-[#fffaf4] dark:hover:bg-slate-800/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {total > 0 && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#e9e4d9] bg-white px-5 py-4 text-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
                className="rounded-xl border border-[#e9e4d9] bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={skip + PAGE_SIZE >= total}
                onClick={() => setSkip(skip + PAGE_SIZE)}
                className="rounded-xl bg-[#183a31] px-4 py-2 font-semibold text-white transition hover:bg-[#245345] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-800 dark:hover:bg-emerald-700"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
