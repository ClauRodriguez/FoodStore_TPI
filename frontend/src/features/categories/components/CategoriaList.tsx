import { flexRender, type Table } from "@tanstack/react-table";
import type { Categoria } from "../types/category.types";
export function CategoriaList({ table }: { table: Table<Categoria> }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#e9e4d9] bg-white shadow-[0_16px_50px_-36px_rgba(24,58,49,0.35)] dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#eee9df] dark:divide-slate-800">
          <thead className="bg-[#f8f6f0] dark:bg-slate-800/80">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300 sm:px-6"
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
                        <span className="text-orange-600" aria-hidden="true">
                          {{ asc: "↑", desc: "↓" }[
                            header.column.getIsSorted() as string
                          ] ?? "↕"}
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
                    className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200 sm:px-6"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#eee9df] bg-[#fdfcf9] px-5 py-4 text-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Página <span className="text-slate-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</span> de{" "}
          <span className="text-slate-900 dark:text-white">{Math.max(table.getPageCount(), 1)}</span>
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="rounded-xl border border-[#e9e4d9] bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-700 dark:hover:text-orange-200"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="rounded-xl bg-[#183a31] px-4 py-2 font-semibold text-white transition hover:bg-[#245345] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-800 dark:hover:bg-emerald-700"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
