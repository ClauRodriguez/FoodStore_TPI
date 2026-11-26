import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { apiErrorMessage } from "@/shared/api/api";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import { CategoriaList } from "../components/CategoriaList";
import { CategoriaModal } from "../components/CategoriaModal";
import { useCategories } from "../hooks/useCategories";
import type { Categoria } from "../types/category.types";

export function CategoriesPage() {
  const {
    categories,
    isLoading,
    error: queryError,
    refetch,
    isAdmin,
    createCategory,
    updateCategory,
    setCategoryActive,
    isSaving,
    updatingStatusId,
  } = useCategories({ includeInactive: true });
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Categoria | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const form = useForm({
    defaultValues: { nombre: "", descripcion: "", activo: true },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (selected) await updateCategory(selected.id, value);
        else await createCategory(value);
        setModalOpen(false);
        setSelected(null);
      } catch (e) {
        setFormError(apiErrorMessage(e));
      }
    },
  });
  const openNew = () => {
    setSelected(null);
    setFormError(null);
    form.reset(
      { nombre: "", descripcion: "", activo: true },
      { keepDefaultValues: true },
    );
    setModalOpen(true);
  };
  const openEdit = (category: Categoria) => {
    setSelected(category);
    setFormError(null);
    form.reset(
      {
        nombre: category.nombre,
        descripcion: category.descripcion ?? "",
        activo: category.activo,
      },
      { keepDefaultValues: true },
    );
    setModalOpen(true);
  };
  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.original.nombre}
        </span>
      ),
    },
    { accessorKey: "descripcion", header: "Descripción" },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
            row.original.activo
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              row.original.activo ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {row.original.activo ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row.original)}
                  className="rounded-lg bg-[#183a31] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#245345] dark:bg-emerald-800 dark:hover:bg-emerald-700"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={updatingStatusId === row.original.id}
                  onClick={() =>
                    void setCategoryActive(
                      row.original.id,
                      !row.original.activo,
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    row.original.activo
                      ? "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950"
                  }`}
                >
                  {updatingStatusId === row.original.id
                    ? "Guardando…"
                    : row.original.activo
                      ? "Desactivar"
                      : "Activar"}
                </button>
              </div>
            ),
          } as ColumnDef<Categoria>,
        ]
      : []),
  ];
  const table = useReactTable({
    data: categories,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });
  const activeCategories = categories.filter((category) => category.activo).length;
  const inactiveCategories = categories.length - activeCategories;

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
              Gestión del catálogo
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Cada antojo, en su lugar.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
              Organizá las categorías de tu menú y mantené cada opción fácil de
              encontrar para tus clientes.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm sm:min-w-64 sm:flex-row sm:items-center sm:justify-between lg:min-w-80 lg:flex-col lg:items-stretch">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-50/60">
                Estado del catálogo
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {categories.length}
                <span className="ml-2 text-sm font-medium text-emerald-50/70">
                  categorías
                </span>
              </p>
              <p className="mt-1 text-sm text-emerald-50/70">
                {activeCategories} activas · {inactiveCategories} inactivas
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f28a50] px-5 py-3 text-sm font-bold text-[#321d13] shadow-lg shadow-orange-950/20 transition hover:bg-[#ffa16c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
              >
                <span
                  aria-hidden="true"
                  className="text-lg leading-none"
                >
                  +
                </span>
                Nueva categoría
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-700 dark:text-orange-300">
              Tu menú
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Categorías
            </h2>
          </div>
          {!isLoading && !queryError && categories.length > 0 && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {categories.length}{" "}
              {categories.length === 1 ? "categoría" : "categorías"} en total
            </p>
          )}
        </div>

        {isLoading ? (
          <LoadingState message="Cargando categorías…" />
        ) : queryError ? (
          <ErrorState message={queryError} onRetry={() => void refetch()} />
        ) : categories.length === 0 ? (
          <EmptyState message="Todavía no hay categorías. Creá la primera para empezar a organizar tu menú." />
        ) : (
          <CategoriaList table={table} />
        )}
      </section>

      <CategoriaModal
        open={modalOpen}
        title={selected ? "Editar categoría" : "Nueva categoría"}
        error={formError}
        saving={isSaving}
        onClose={() => {
          if (!isSaving) {
            setModalOpen(false);
            setSelected(null);
            setFormError(null);
          }
        }}
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : "El nombre es obligatorio",
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Nombre
              <input
                autoFocus
                className="mt-1 w-full rounded-xl border border-[#e5dfd1] bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-sm text-red-700 dark:text-red-300">
                  {field.state.meta.errors.join(", ")}
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
                className="mt-1 min-h-24 w-full rounded-xl border border-[#e5dfd1] bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>
        <form.Field name="activo">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
              Activa en el catálogo
            </label>
          )}
        </form.Field>
      </CategoriaModal>
    </main>
  );
}
