import { useState, type ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table'
import { cn } from '../../lib/cn'
import { INTENT_CLASSES, type Intent } from './intent'
import { Skeleton } from './Skeleton'

// Static strings so Tailwind's scanner sees them (a template literal wouldn't
// be picked up).
const HIDE_BELOW_CLASSES = {
  sm: 'max-sm:hidden',
  md: 'max-md:hidden',
  lg: 'max-lg:hidden',
} as const

export interface DataTableProps<TData> {
  /** TanStack column definitions. Cells render into a dense, fixed-rhythm grid. */
  columns: ColumnDef<TData, any>[]
  data: TData[]
  /** Accessible name for the table — always required. */
  ariaLabel: string
  /** Stable row identity across live updates (prevents row-state bleed). */
  getRowId?: (row: TData) => string
  /**
   * Tint a row by state (e.g. breached queues). Use sparingly — a wash on
   * every row means nothing stands out. The tinted state must also appear
   * as text in a column (a StatusBadge, a label): the wash reinforces, it
   * never carries meaning alone (WCAG 1.4.1).
   */
  rowIntent?: (row: TData) => Intent | undefined
  /** Initial sort; users can re-sort by clicking sortable headers. */
  initialSorting?: SortingState
  /** Rendered inside the body when `data` is empty (compose <EmptyState>). */
  empty?: ReactNode
  /** Render skeleton rows instead of data. */
  loading?: boolean
  /** Number of skeleton rows while loading. */
  loadingRows?: number
  className?: string
}

/**
 * A dense, sortable data table — the workhorse of every ops page. Thin
 * wrapper over TanStack Table: column defs stay in the caller's hands; this
 * component owns rhythm, sticky header, sorting affordances, and the
 * loading/empty states, so tables look identical across pages.
 */
export function DataTable<TData>({
  columns,
  data,
  ariaLabel,
  getRowId,
  rowIntent,
  initialSorting = [],
  empty,
  loading = false,
  loadingRows = 5,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const leafColumns = table.getAllLeafColumns()
  const colCount = leafColumns.length

  return (
    <div className={cn('scroll-fade-x overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm" aria-label={ariaLabel}>
        <thead className="sticky top-0 z-10 bg-surface">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-line">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                const meta = header.column.columnDef.meta
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={
                      sorted === 'asc'
                        ? 'ascending'
                        : sorted === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    className={cn(
                      'px-3 py-2 text-xs font-medium whitespace-nowrap text-ink-muted first:pl-4 last:pr-4',
                      meta?.align === 'end' ? 'text-right' : 'text-left',
                      meta?.hideBelow && HIDE_BELOW_CLASSES[meta.hideBelow],
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-sm hover:text-ink',
                          sorted && 'text-ink',
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span aria-hidden className="w-2 text-2xs">
                          {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : ''}
                        </span>
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }, (_, i) => (
              <tr key={i} className="border-b border-line last:border-b-0">
                {leafColumns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'px-3 py-3 first:pl-4 last:pr-4',
                      column.columnDef.meta?.hideBelow &&
                        HIDE_BELOW_CLASSES[column.columnDef.meta.hideBelow],
                    )}
                  >
                    <Skeleton className="h-4 w-full max-w-24" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colCount}>{empty}</td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row: Row<TData>) => {
              const intent = rowIntent?.(row.original)
              return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-line transition-colors last:border-b-0 hover:bg-hover',
                    intent && INTENT_CLASSES[intent].surface,
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 py-2 align-middle first:pl-4 last:pr-4',
                        cell.column.columnDef.meta?.align === 'end' &&
                          'text-right',
                        cell.column.columnDef.meta?.hideBelow &&
                          HIDE_BELOW_CLASSES[
                            cell.column.columnDef.meta.hideBelow
                          ],
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
