'use client';
import {
   ColumnDef,
   RowData,
   type Table as TableType,
   flexRender,
} from '@tanstack/react-table';
import { DataTableFeatures, features } from './data-table-features';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '../table';

interface DataTableProps<TData extends RowData> {
   table: TableType<typeof features, TData>;
}

export function DataTable<TData extends RowData>({
   table,
}: DataTableProps<TData>) {
   return (
      <div className="overflow-hidden">
         {table.getRowModel()?.rows.length ? (
            <Table>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                           return (
                              <TableHead
                                 key={header.id}
                                 className="first:pl-6 last:pr-6"
                              >
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
                           data-state={row.getIsSelected() && 'selected'}
                        >
                           {row.getVisibleCells().map((cell) => (
                              <TableCell
                                 key={cell.id}
                                 className="first:pl-6 last:pr-6"
                              >
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
                           colSpan={table.getAllColumns().length}
                           className="h-24 text-center first:ml-6 last:mr-6"
                        >
                           No results.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         ) : (
            'No results.'
         )}
      </div>
   );
}
