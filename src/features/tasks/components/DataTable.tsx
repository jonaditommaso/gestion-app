"use client"
import { useState } from "react"

import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { DataTableBulkActions } from "./DataTableBulkActions"

interface DataTableProps<TData extends Record<string, unknown>, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('workspaces');

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  return (
    <div className="bg-background p-4 rounded-lg">
      {/* Bulk Actions Bar - Appears only when rows are selected */}
      {selectedCount > 0 && (
        <DataTableBulkActions
          selectedTasks={selectedRows.map(row => row.original as TData)}
          selectedCount={selectedCount}
          onClearSelection={() => table.resetRowSelection()}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
          {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isFeatured = row.original.featured as boolean | undefined;
                return (
                  <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={isFeatured ? 'bg-yellow-50/80 dark:bg-yellow-950/20 hover:bg-yellow-100/80 dark:hover:bg-yellow-950/30' : ''}
                  >
                      {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                      ))}
                  </TableRow>
                );
              })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('no-results')}
              </TableCell>
            </TableRow>
          )}
          </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t('prev')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  )
}
