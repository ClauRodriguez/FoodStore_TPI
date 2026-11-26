import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, apiErrorMessage } from '@/shared/api/api'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

export function AdminDashboardPage() {
  const query = useQuery({
    queryKey: ['admin-order-summary'],
    queryFn: async () =>
      (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
  })

  if (query.isPending) {
    return <LoadingState message="Cargando resumen…" />
  }

  if (query.isError) {
    return (
      <ErrorState
        message={apiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const metrics = [
    { label: 'Pedidos pendientes', value: query.data.pendientes, accent: 'bg-orange-500' },
    { label: 'En preparación', value: query.data.en_preparacion, accent: 'bg-amber-500' },
    { label: 'Entregados', value: query.data.entregados, accent: 'bg-emerald-500' },
    { label: 'Cancelados', value: query.data.cancelados, accent: 'bg-rose-500' },
    { label: 'Pedidos de hoy', value: query.data.pedidos_hoy, accent: 'bg-sky-500' },
    {
      label: 'Ingresos entregados',
      value: formatPrice(query.data.ingresos_entregados),
      accent: 'bg-[#f28a50]',
    },
  ]

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
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-orange-300" />
              Foodstore · Operaciones
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              El pulso de tu negocio.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
              Un resumen claro de pedidos y ventas para que tengas todo bajo
              control.
            </p>
          </div>
          <Link
            to="/admin/pedidos"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f28a50] px-5 py-3 text-sm font-bold text-[#321d13] shadow-lg shadow-orange-950/20 transition hover:bg-[#ffa16c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
          >
            Administrar pedidos
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
            Actividad
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Resumen de hoy
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="group rounded-3xl border border-[#e9e4d9] bg-white p-5 shadow-[0_16px_50px_-36px_rgba(24,58,49,0.35)] transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {metric.label}
                </h3>
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${metric.accent}`}
                />
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {metric.value}
              </p>
              <div className="mt-5 h-px bg-[#f1eee7] dark:bg-slate-800" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Foodstore · Resumen operativo
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
