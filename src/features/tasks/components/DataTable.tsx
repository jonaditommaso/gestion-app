"use client"
import { useState, useEffect } from "react"

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
import { useTranslations } from "next-intl"
import { DataTableBulkActions } from "./DataTableBulkActions"
import { AnimatePresence } from "motion/react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config"
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id"
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace"
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { WorkspaceConfigKey, DEFAULT_WORKSPACE_CONFIG } from "@/app/workspaces/constants/workspace-config-keys"
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions"
import { PERMISSIONS } from "@/features/roles/constants"

interface DataTableProps<TData extends Record<string, unknown>, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('workspaces');
  const workspaceId = useWorkspaceId();
  const config = useWorkspaceConfig();
  const { data: workspaces } = useGetWorkspaces();
  const { mutate: updateWorkspace } = useUpdateWorkspace();
  const { hasPermission } = useCurrentUserPermissions();
  const canWrite = hasPermission(PERMISSIONS.WRITE);
  const canDelete = hasPermission(PERMISSIONS.DELETE);

  const visibleColumns = (canWrite || canDelete)
    ? columns
    : columns.filter(col => ('id' in col ? col.id !== 'select' : true));

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const pageSize = config[WorkspaceConfigKey.TABLE_PAGE_SIZE] || 10

  const table = useReactTable({
    data,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  // Update table pageSize when config changes
  useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const currentPageRowCount = table.getRowModel().rows.length
  const totalFilteredRows = table.getFilteredRowModel().rows.length
  const isAllPageRowsSelected = table.getIsAllPageRowsSelected()

  // Generar array de números de página para la paginación
  const generatePaginationRange = () => {
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = table.getPageCount()

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, -1, totalPages]
    }

    if (currentPage >= totalPages - 2) {
      return [1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages]
  }

  // Update page size and persist to workspace config
  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize)
    const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId)

    if (!currentWorkspace) return

    const currentMetadata = currentWorkspace.metadata
      ? (typeof currentWorkspace.metadata === 'string'
          ? JSON.parse(currentWorkspace.metadata)
          : currentWorkspace.metadata)
      : {}

    // Only save if different from default
    if (size !== DEFAULT_WORKSPACE_CONFIG[WorkspaceConfigKey.TABLE_PAGE_SIZE]) {
      currentMetadata[WorkspaceConfigKey.TABLE_PAGE_SIZE] = size
    } else {
      delete currentMetadata[WorkspaceConfigKey.TABLE_PAGE_SIZE]
    }

    updateWorkspace({
      json: { metadata: JSON.stringify(currentMetadata) },
      param: { workspaceId }
    })
  }

  // Select all rows across all pages
  const handleSelectAllPages = () => {
    const allRowIds: Record<string, boolean> = {}
    table.getFilteredRowModel().rows.forEach(row => {
      allRowIds[row.id] = true
    })
    table.setRowSelection(allRowIds)
  }

  // Clear selection
  const handleClearSelection = () => {
    table.resetRowSelection()
  }

  return (
    <div className="bg-background p-4 rounded-lg">
      {/* Bulk Actions Bar - Appears only when rows are selected */}
      <AnimatePresence mode="wait">
        {selectedCount > 0 && (canWrite || canDelete) && (
          <DataTableBulkActions
            selectedTasks={selectedRows.map(row => row.original as TData)}
            selectedCount={selectedCount}
            onClearSelection={handleClearSelection}
            isAllPageRowsSelected={isAllPageRowsSelected}
            totalFilteredRows={totalFilteredRows}
            currentPageRowCount={currentPageRowCount}
            onSelectAllPages={handleSelectAllPages}
          />
        )}
      </AnimatePresence>

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

        {/* Paginación y controles - todo alineado a la derecha */}
        <div className="flex items-center justify-end py-4">
          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]" title={t('rows-per-page')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>

            {/* Paginación */}
            {table.getPageCount() > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => table.previousPage()}
                      className={!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    >
                      {t('prev')}
                    </PaginationPrevious>
                  </PaginationItem>

                  {generatePaginationRange().map((pageNum, idx) => {
                    if (pageNum === -1) {
                      return (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }

                    const isActive = table.getState().pagination.pageIndex + 1 === pageNum
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => table.setPageIndex(pageNum - 1)}
                          isActive={isActive}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => table.nextPage()}
                      className={!table.getCanNextPage() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    >
                      {t('next')}
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}


          </div>
        </div>
    </div>
  )
}
