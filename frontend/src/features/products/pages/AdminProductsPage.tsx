import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { apiErrorMessage } from '@/shared/api/api'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { ProductoList } from '../components/ProductoList'
import { ProductoModal } from '../components/ProductoModal'
import { useProducts } from '../hooks/useProducts'
import type { Producto, ProductoInput } from '../types/product.types'

const PRODUCT_PAGE_SIZE = 10
const PRODUCT_FETCH_LIMIT = 100

export function AdminProductsPage() {
  const {
    products,
    total,
    isLoading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    isSaving,
    isUpdatingStock,
    deletingId,
  } = useProducts({ limit: PRODUCT_FETCH_LIMIT })
  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Producto | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const selectableCategories = categories.filter(
    (category) => category.activo || category.id === selected?.categoria_id,
  )

  const form = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      categoria_id: 0,
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      const data: ProductoInput = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        categoria_id: Number(value.categoria_id),
        disponible: value.disponible,
      }
      setFormError(null)
      try {
        if (selected) await updateProduct(selected.id, data)
        else await createProduct(data)
        setModalOpen(false)
        setSelected(null)
      } catch (submitError) {
        setFormError(apiErrorMessage(submitError))
      }
    },
  })

  const openNew = () => {
    setSelected(null)
    setFormError(null)
    form.reset(
      {
        nombre: '',
        descripcion: '',
        precio_base: 0,
        imagen_url: '',
        stock: 0,
        categoria_id: 0,
        disponible: true,
      },
      { keepDefaultValues: true },
    )
    setModalOpen(true)
  }

  const openEdit = (product: Producto) => {
    setSelected(product)
    setFormError(null)
    form.reset(
      {
        nombre: product.nombre,
        descripcion: product.descripcion ?? '',
        precio_base: product.precio_base,
        imagen_url: product.imagen_url ?? '',
        stock: product.stock,
        categoria_id: product.categoria_id,
        disponible: product.disponible,
      },
      { keepDefaultValues: true },
    )
    setModalOpen(true)
  }

  const columns: ColumnDef<Producto>[] = [
    {
      id: 'imagen',
      header: 'Imagen',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.imagen_url ? (
          <img
            src={row.original.imagen_url}
            alt={row.original.nombre}
            loading="lazy"
            className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/5"
          />
        ) : (
          <span className="text-sm text-slate-500">Sin imagen</span>
        ),
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.original.nombre}
        </span>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => row.original.descripcion ?? '—',
    },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: ({ row }) =>
        row.original.precio_base.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
    },
    {
      accessorFn: (product) => product.categoria.nombre,
      id: 'categoria',
      header: 'Categoría',
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const product = row.original
        const updateStock = (stock: number) =>
          updateProductStock(product.id, {
            stock,
            disponible: product.disponible,
          })

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Reducir stock de ${product.nombre}`}
              disabled={isUpdatingStock || product.stock <= 0}
              onClick={() => void updateStock(product.stock - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#e9e4d9] bg-white font-bold transition hover:border-orange-300 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              −
            </button>
            <span
              className={`min-w-9 text-center text-sm font-bold ${
                product.stock > 0
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              {product.stock}
            </span>
            <button
              type="button"
              aria-label={`Aumentar stock de ${product.nombre}`}
              disabled={isUpdatingStock}
              onClick={() => void updateStock(product.stock + 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#e9e4d9] bg-white font-bold transition hover:border-orange-300 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              +
            </button>
          </div>
        )
      },
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilidad',
      cell: ({ row }) => {
        const product = row.original
        return (
          <button
            type="button"
            disabled={isUpdatingStock}
            onClick={() =>
              void updateProductStock(product.id, {
                stock: product.stock,
                disponible: !product.disponible,
              })
            }
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              product.disponible
                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                product.disponible ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {product.disponible ? 'Disponible' : 'Pausado'}
          </button>
        )
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openEdit(product)}
              className="rounded-lg bg-[#183a31] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#245345] dark:bg-emerald-800 dark:hover:bg-emerald-700"
            >
              Editar
            </button>
            <button
              type="button"
              disabled={deletingId === product.id}
              onClick={() => {
                if (confirm(`¿Eliminar "${product.nombre}"?`)) {
                  void deleteProduct(product.id)
                }
              }}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950"
            >
              Eliminar
            </button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PRODUCT_PAGE_SIZE } },
  })

  useEffect(() => {
    const pageCount = Math.max(1, table.getPageCount())
    if (table.getState().pagination.pageIndex >= pageCount) {
      table.setPageIndex(pageCount - 1)
    }
  }, [products.length, table])

  if (isLoading) return <LoadingState message="Cargando productos…" />
  if (error) return <ErrorState message={error} onRetry={() => void refetch()} />

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
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-orange-300"
              />
              Gestión del menú
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              El menú, listo para tentar.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
              Administrá productos, disponibilidad y stock desde un solo lugar.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm sm:min-w-64 sm:flex-row sm:items-center sm:justify-between lg:min-w-80 lg:flex-col lg:items-stretch">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-50/60">
                Inventario
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {total}
                <span className="ml-2 text-sm font-medium text-emerald-50/70">
                  productos
                </span>
              </p>
              {total > products.length && (
                <p className="mt-1 text-xs text-emerald-50/70">
                  Se muestran hasta {PRODUCT_FETCH_LIMIT} productos
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f28a50] px-5 py-3 text-sm font-bold text-[#321d13] shadow-lg shadow-orange-950/20 transition hover:bg-[#ffa16c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                +
              </span>
              Nuevo producto
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
              Inventario
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Productos
            </h2>
          </div>
          <label className="w-full text-sm font-semibold text-slate-700 dark:text-slate-200 sm:max-w-sm">
            Buscar en los productos cargados
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                table.setPageIndex(0)
              }}
              placeholder="Nombre, descripción o categoría…"
              className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
            />
          </label>
        </div>

        {categoriesError && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            No se pudieron cargar las categorías para crear o editar productos:
            {' '}{categoriesError}
          </p>
        )}

        {products.length === 0 ? (
          <EmptyState message="No hay productos cargados." />
        ) : table.getRowModel().rows.length === 0 ? (
          <EmptyState message="No hay productos que coincidan con la búsqueda." />
        ) : (
          <ProductoList table={table} />
        )}
      </section>

      <ProductoModal
        open={modalOpen}
        title={selected ? 'Editar producto' : 'Nuevo producto'}
        error={formError}
        saving={isSaving}
        onClose={() => {
          if (!isSaving) {
            setModalOpen(false)
            setSelected(null)
            setFormError(null)
          }
        }}
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : 'El nombre es obligatorio',
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Nombre
              <input
                autoFocus
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
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

        <form.Field name="descripcion">
          {(field) => (
            <label className="block text-sm font-semibold">
              Descripción
              <textarea
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>

        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              Number.isFinite(value) && value >= 0
                ? undefined
                : 'El precio no puede ser negativo',
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Precio base
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(Number(event.target.value))
                }
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-sm text-red-700 dark:text-red-300">
                  {field.state.meta.errors.join(', ')}
                </span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              selectableCategories.some((category) => category.id === value)
                ? undefined
                : 'Seleccione una categoría',
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Categoría
              <select
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                disabled={isLoadingCategories || Boolean(categoriesError)}
                onChange={(event) =>
                  field.handleChange(Number(event.target.value))
                }
              >
                <option value={0}>
                  {isLoadingCategories
                    ? 'Cargando categorías…'
                    : 'Seleccioná una categoría'}
                </option>
                {selectableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <span className="block text-sm text-red-700 dark:text-red-300">
                  {field.state.meta.errors.join(', ')}
                </span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isInteger(value) && value >= 0
                ? undefined
                : 'El stock debe ser un entero no negativo',
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Stock
              <input
                type="number"
                min="0"
                step="1"
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(Number(event.target.value))
                }
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-sm text-red-700 dark:text-red-300">
                  {field.state.meta.errors.join(', ')}
                </span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="imagen_url">
          {(field) => (
            <label className="block text-sm font-semibold">
              URL de imagen (opcional)
              <input
                type="url"
                className="mt-1.5 w-full rounded-xl border border-[#e5dfd1] bg-[#fffdf9] px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
              Disponible
            </label>
          )}
        </form.Field>
      </ProductoModal>
    </main>
  )
}
