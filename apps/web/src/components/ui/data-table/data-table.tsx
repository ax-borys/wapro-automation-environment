'use client';
import {
   ColumnDef,
   Row,
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
import {
   Empty,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from '../empty';
import { FileTextIcon, RecordIcon } from '@phosphor-icons/react';
import React, { Fragment, ReactNode } from 'react';

interface DataTableProps<TData extends RowData> {
   table: TableType<typeof features, TData>;
}

export function DataTable<TData extends RowData>({
   table,
   expandedRender,
}: DataTableProps<TData> & {
   expandedRender?: (row: Row<typeof features, TData>) => ReactNode;
}) {
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
                                 style={{
                                    width: header.getSize(),
                                    minWidth: 0,
                                 }}
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
                  {table.getRowModel().rows.map((row) => (
                     <Fragment key={row.id}>
                        <TableRow
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

                        {expandedRender && row.getIsExpanded() ? (
                           <TableRow>
                              <TableCell
                                 className="px-0"
                                 colSpan={row.getVisibleCells().length}
                              >
                                 {expandedRender(row)}
                              </TableCell>
                           </TableRow>
                        ) : null}
                     </Fragment>
                  ))}
               </TableBody>
            </Table>
         ) : (
            <Empty>
               <EmptyHeader>
                  <EmptyMedia variant={'icon'}>
                     <FileTextIcon />
                  </EmptyMedia>
                  <EmptyTitle>No records found</EmptyTitle>
                  <EmptyDescription>
                     Unfortunatly, no records matched filters.
                  </EmptyDescription>
               </EmptyHeader>
            </Empty>
         )}
      </div>
   );
}
