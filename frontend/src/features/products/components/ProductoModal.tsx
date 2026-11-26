import type { FormEvent, ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  error: string | null
  saving: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

export function ProductoModal({
  open,
  title,
  error,
  saving,
  onClose,
  onSubmit,
  children,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102820]/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-[#fffdf9] shadow-2xl shadow-emerald-950/30 dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-[#eee9df] px-6 pb-5 pt-6 dark:border-slate-800 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
            Gestión del menú
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>
        <form onSubmit={onSubmit} className="max-h-[80vh] space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
          {children}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-[#eee9df] pt-5 dark:border-slate-800">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-[#e5dfd1] px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-[#f5f1e8] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#183a31] px-5 py-2.5 font-bold text-white transition hover:bg-[#245345] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-800 dark:hover:bg-emerald-700"
            >
              {saving ? 'Guardando…' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
