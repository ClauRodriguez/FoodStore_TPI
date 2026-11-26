import { useState } from 'react'
import {
  flexRender,
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useAuth } from '../hooks/useAuth'
import type { AdminUser } from '../types/auth.types'

export function AdminUsersPage() {
  const { user } = useAuth()
  const { users, isLoading, error, refetch, setUserActive, isUpdating } =
    useAdminUsers()

  const [sorting, setSorting] = useState<SortingState>([])
  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'username',
      header: 'Usuario',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          @{row.original.username}
        </span>
      ),
    },
    {
      accessorKey: 'full_name',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.original.full_name}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => (
        <span className="rounded-full bg-[#f5f1e8] px-3 py-1 text-xs font-bold capitalize text-[#46584b] dark:bg-slate-800 dark:text-slate-200">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
            row.original.disabled
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              row.original.disabled ? 'bg-slate-400' : 'bg-emerald-500'
            }`}
          />
          {row.original.disabled ? 'Desactivado' : 'Activo'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acción',
      enableSorting: false,
      cell: ({ row }) => {
        const adminUser = row.original
        if (adminUser.id === user?.id) {
          return (
            <span className="text-xs font-semibold text-slate-400">
              Tu cuenta
            </span>
          )
        }

        return (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              setUserActive({
                id: adminUser.id,
                active: adminUser.disabled,
              })
            }
            className={`rounded-xl px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              adminUser.disabled
                ? 'bg-[#183a31] text-white hover:bg-[#245345] dark:bg-emerald-800 dark:hover:bg-emerald-700'
                : 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950'
            }`}
          >
            {adminUser.disabled ? 'Activar' : 'Desactivar'}
          </button>
        )
      },
    },
  ]
  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) return <LoadingState message="Cargando usuarios…" />
  if (error) return <ErrorState message={error} onRetry={() => void refetch()} />

  const activeUsers = users.filter((adminUser) => !adminUser.disabled).length
  const inactiveUsers = users.length - activeUsers

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
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-orange-300" />
              Equipo · Administración
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Las personas detrás de cada pedido.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
              Gestioná el acceso y el estado de las cuentas de Foodstore desde
              un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-50/60">
                Cuentas activas
              </p>
              <p className="mt-2 text-3xl font-extrabold">{activeUsers}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-50/60">
                Desactivadas
              </p>
              <p className="mt-2 text-3xl font-extrabold">{inactiveUsers}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
              Accesos
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Administración de usuarios
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {users.length} {users.length === 1 ? 'cuenta' : 'cuentas'}
          </p>
        </div>

        {users.length === 0 ? (
          <EmptyState message="No hay usuarios para mostrar." />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#e9e4d9] bg-white shadow-[0_16px_50px_-36px_rgba(24,58,49,0.35)] dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#f8f6f0] text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-5 py-4 font-bold sm:px-6"
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
                              <span aria-hidden="true" className="text-orange-600">
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
                          className="px-5 py-4 text-sm sm:px-6"
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
      </section>
    </main>
  )
}
