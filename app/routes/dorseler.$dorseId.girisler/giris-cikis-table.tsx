import { useState } from "react";
import { Link } from "@remix-run/react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  type ColumnDef,
  ColumnFiltersState,
  flexRender,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export type GirisCikisT = {
  id: String;
  girisTarihi: String;
  getiren: String;
  yuk: String;
  cikisTarihi: String;
  goturen: String;
};

export const columns: ColumnDef<GirisCikisT>[] = [
  {
    accessorKey: "girisTarihi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Giriş Tarihi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const formatted = new Intl.DateTimeFormat("tr", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }).format(new Date(row.getValue("girisTarihi")));

      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "cikisTarihi",
    header: "Çıkış Tarihi",
    cell: ({ row }) => {
      if (row.getValue("cikisTarihi")) {
        const formatted = new Intl.DateTimeFormat("tr", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "Europe/Istanbul",
        }).format(new Date(row.getValue("cikisTarihi")));

        return <div className="text-left font-medium">{formatted}</div>;
      } else {
        return (
          <div className="text-left font-medium">Araç Parkta Görülüyor.</div>
        );
      }
    },
  },
  {
    accessorKey: "getiren",
    header: "Getiren",
  },
  {
    accessorKey: "goturen",
    header: "Götüren",
  },
  {
    accessorKey: "yuk",
    header: "Yük",
  },
  {
    id: "aksiyon",
    cell: ({ row }) => {
      /* const payment = row.original; */

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menü</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksiyon</DropdownMenuLabel>
            {!row.original.cikisTarihi && (
              <DropdownMenuItem>
                <Link to={`${row.original.id}/cikis`}>Çıkış Yap</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to={`${row.original.id}`}>Detay</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to={`${row.original.id}/delete`}>Sil</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="rounded-md border">
      <div className="flex items-center py-4">
        <Input
          placeholder="Giriş Tarihi Süz..."
          value={table.getColumn("girisTarihi")?.getFilterValue() as string}
          onChange={(event) =>
            table.getColumn("girisTarihi")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Sütunlar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Kayıtlı veri yok!
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
          Önceki
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Sonraki
        </Button>
      </div>
    </div>
  );
}
