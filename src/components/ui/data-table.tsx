'use client';

import React from 'react';
import {
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
} from "lucide-react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];

  // Primary Button Props
  primaryButtonText: string; // Text for the primary button
  onPrimaryButton: () => void; // Handler for the primary button click

  // Secondary Button Props (Optional)
  secondaryButtonText?: string; // Text for the secondary button
  onSecondaryButton?: () => void; // Handler for the secondary button click

  pageSize?: number; // Optional prop to set page size, default to 5
}

export function DataTable<TData>({
  columns,
  data,
  primaryButtonText,
  onPrimaryButton,
  secondaryButtonText,
  onSecondaryButton,
  pageSize = 5, // Default value set to 5
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize, // Set the initial page size
      },
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: {
      size: 200, //starting column size
      minSize: 100, //enforced during column resizing
      maxSize: 500, //enforced during column resizing
    },
  });

  return (
    <div className="w-full">
      {/* Flex container for Filter and dynamic buttons */}
      <div className="flex items-center justify-between py-4">
        {/* Input for filtering */}
        <Input
          placeholder="Filter data..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        {/* Button Container */}
        <div className="flex justify-end mb-4 space-x-2">
          {/* Secondary Button (Rendered Only If Props Are Provided) */}
          {secondaryButtonText && onSecondaryButton && (
            <Button onClick={onSecondaryButton} variant="secondary">
              <PlusIcon className="h-4 w-4 mr-2" />
              {secondaryButtonText}
            </Button>
          )}
          {/* Primary Button */}
          {primaryButtonText && onPrimaryButton && (
            <Button onClick={onPrimaryButton}>
              <PlusIcon className="h-4 w-4 mr-2" />
              {primaryButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200 overflow-x-auto table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className="flex items-center cursor-pointer select-none"
                        onClick={() => header.column.toggleSorting()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {/* Sort Indicators */}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? (
                            <CaretSortIcon className="ml-2 h-4 w-4" />
                          ) : (
                            <CaretSortIcon className="ml-2 h-4 w-4 rotate-180" />
                          )
                        ) : (
                          <CaretSortIcon className="ml-2 h-4 w-4 opacity-50" />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-4 mt-12">
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
