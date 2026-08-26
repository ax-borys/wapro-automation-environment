import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import { EditProductDialog } from '@/components/ui/edit-dialog';
import { OfferModel, ProductModel } from '@/entities/offer';
import {
   PauseCircleIcon,
   PlayCircleIcon,
   PlayIcon,
   SealCheckIcon,
   SealIcon,
   WarningIcon,
} from '@phosphor-icons/react';
import { createColumnHelper } from '@tanstack/react-table';
import { EditIcon } from 'lucide-react';
import Image from 'next/image';

export type OfferData = Pick<
   OfferModel,
   'title' | 'imgSrc' | 'active' | 'approved' | 'items'
>;

const columnHelper = createColumnHelper<DataTableFeatures, OfferData>();

export const columns = columnHelper.columns([
   columnHelper.accessor('imgSrc', {
      header: () => <div>Preview</div>,
      cell: ({ row: r }) => {
         const imgUrl = r.getValue('imgSrc') as string;

         return (
            <div className="flex items-center">
               <Image
                  src={imgUrl}
                  alt="preview"
                  width={65}
                  height={65}
                  className="size-[65px] object-cover"
               />
            </div>
         );
      },
      size: 70,
   }),
   columnHelper.accessor('title', {
      header: () => <div>Title</div>,
      cell: ({ row: r }) => {
         const title = r.getValue('title') as string;

         return <div>{title}</div>;
      },
      minSize: 300,
      size: 900,
      maxSize: 1500,
   }),
   columnHelper.accessor('approved', {
      header: () => <div className="text-center">Approved</div>,
      cell: ({ row: r }) => {
         const approved = r.getValue('approved') as boolean;

         return (
            <div className="flex justify-center">
               {approved ? (
                  <div className="bg-green-100 rounded-full p-1  text-green-600">
                     <SealCheckIcon className="size-5!" />
                  </div>
               ) : (
                  <div className="bg-orange-100 rounded-md p-1 text-orange-600">
                     <WarningIcon className="size-5!" />
                  </div>
               )}
            </div>
         );
      },
      size: 50,
   }),
   columnHelper.accessor('active', {
      header: () => <div className="text-center">Active</div>,
      cell: ({ row: r }) => {
         const active = r.getValue('active') as boolean;

         return (
            <div className="flex justify-center">
               {active ? (
                  <span className="text-green-600">Yes</span>
               ) : (
                  <span className="text-red-600">No</span>
               )}
            </div>
         );
      },
      size: 50,
   }),
   columnHelper.accessor('items', {
      header: () => <div className="text-center">Products</div>,
      cell: ({ row: r }) => {
         const items = r.getValue('items') as ProductModel[];

         return (
            <div className="text-center">
               {items.length ? (
                  items.length
               ) : (
                  <span className="text-destructive">0</span>
               )}
            </div>
         );
      },
      size: 70,
   }),
   columnHelper.display({
      id: 'edit',
      cell: ({ row: r }) => {
         return (
            <div className="flex flex-col w-full">
               <EditProductDialog />
            </div>
         );
      },
      size: 40,
      minSize: 40,
   }),
]);
