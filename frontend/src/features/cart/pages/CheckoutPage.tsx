import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { api, apiErrorMessage } from '@/shared/api/api'
import { EmptyState } from '@/shared/components/EmptyState'
import { useNotificationStore } from '@/store/notificationStore'
import { useCartStore } from '../store/cartStore'

const formaPagoOptions = ['EFECTIVO', 'TRANSFERENCIA'] as const
type FormaPago = (typeof formaPagoOptions)[number]

interface CheckoutFormValues {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface PedidoCreate {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}

interface PedidoCreado {
  id: number
  estado: string
  total: number
}

export function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const vaciarCarrito = useCartStore((state) => state.vaciar)
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const createOrder = useMutation({
    mutationFn: async (data: PedidoCreate) =>
      (await api.post<PedidoCreado>('/pedidos', data)).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order-summary'] }),
      ])
      vaciarCarrito()
      showNotification(
        '¡Pedido confirmado! Ya lo estamos procesando. Podés seguir su estado en Mis pedidos.',
      )
      navigate('/mis-pedidos', { replace: true })
    },
  })

  const defaultValues: CheckoutFormValues = {
  direccion_entrega: '',
  forma_pago: 'EFECTIVO',
  notas: '',
}

const form = useForm({
  defaultValues,
    onSubmit: async ({ value }) => {
      setFormError(null)

      const payload: PedidoCreate = {
        items: items.map(({ producto_id, cantidad }) => ({
          producto_id,
          cantidad,
        })),
        forma_pago: value.forma_pago,
        direccion_entrega: value.direccion_entrega.trim(),
        notas: value.notas.trim() || null,
      }

      try {
        await createOrder.mutateAsync(payload)
      } catch (error) {
        setFormError(apiErrorMessage(error))
      }
    },
  })

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">
        <section className="rounded-[2rem] bg-[#faecd7] p-6 shadow-xl shadow-orange-950/10 dark:bg-[#2b211b] sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-800 dark:text-orange-200">
            Foodstore · Tu pedido
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Finalizar compra
          </h1>
          <p className="mt-2 text-slate-600 dark:text-orange-100/70">
            Tu carrito está vacío por ahora.
          </p>
        </section>
        <div className="mt-6">
          <EmptyState message="Agregá productos al carrito antes de continuar." />
        </div>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          Explorar el menú
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#faecd7] px-6 py-8 text-slate-900 shadow-xl shadow-orange-950/10 dark:bg-[#2b211b] dark:text-white sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full bg-orange-400/30 blur-3xl"
        />
        <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
          Foodstore · Un paso más
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Finalizar compra
            </h1>
            <p className="mt-2 text-slate-600 dark:text-orange-100/70">
              Ya casi está. Completá los datos para enviar tu pedido.
            </p>
          </div>
          <p className="rounded-2xl border border-orange-200/80 bg-white/70 px-4 py-3 text-sm font-bold text-orange-900 dark:border-orange-900 dark:bg-[#38291f] dark:text-orange-100">
            {items.reduce((total, item) => total + item.cantidad, 0)} productos
          </p>
        </div>
      </section>

      <form
        className="mt-6 space-y-5 rounded-3xl border border-orange-100 bg-white p-6 shadow-[0_16px_50px_-36px_rgba(194,92,36,0.3)] dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        {formError && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {formError}
          </p>
        )}

        <form.Field
          name="direccion_entrega"
          validators={{
            onChange: ({ value }) => {
              const length = value.trim().length
              if (length < 5) return 'La dirección debe tener al menos 5 caracteres'
              if (length > 200) return 'La dirección no puede superar 200 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Dirección de entrega
              <textarea
                required
                maxLength={200}
                className="mt-1.5 min-h-24 w-full rounded-xl border border-orange-100 bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-sm text-red-700 dark:text-red-300">
                  {field.state.meta.errors.join(', ')}
                </span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="forma_pago">
          {(field) => (
            <label className="block text-sm font-semibold">
              Forma de pago
              <select
                className="mt-1.5 w-full rounded-xl border border-orange-100 bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === 'EFECTIVO' || value === 'TRANSFERENCIA') {
                    field.handleChange(value)
                  }
                }}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </label>
          )}
        </form.Field>

        <form.Field name="notas">
          {(field) => (
            <label className="block text-sm font-semibold">
              Notas (opcional)
              <textarea
                className="mt-1.5 min-h-20 w-full rounded-xl border border-orange-100 bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>

        <div className="flex flex-col-reverse gap-3 border-t border-orange-100 pt-5 sm:flex-row sm:justify-between dark:border-slate-800">
          <Link to="/carrito" className="rounded-xl border border-orange-200 px-4 py-2.5 text-center font-bold text-orange-800 transition hover:bg-orange-50 dark:border-orange-900 dark:text-orange-200 dark:hover:bg-orange-950/40">
            Volver al carrito
          </Link>
          <button
            type="submit"
            disabled={createOrder.isPending}
            className="rounded-xl bg-orange-600 px-5 py-2.5 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createOrder.isPending ? 'Creando pedido…' : 'Confirmar pedido'}
          </button>
        </div>
      </form>
    </main>
  )
}