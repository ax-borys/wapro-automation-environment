import { EditOffer } from '@/components/features/edit-offer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import { EditProductDialog } from '@/components/ui/edit-dialog';
import { OfferModel, ProductModel } from '@/entities/offer';
import {
   CheckFatIcon,
   CheckIcon,
   CircleIcon,
   PauseCircleIcon,
   PauseIcon,
   PlayCircleIcon,
   PlayIcon,
   PulseIcon,
   SealCheckIcon,
   SealIcon,
   WarningIcon,
} from '@phosphor-icons/react';
import { XIcon } from '@phosphor-icons/react/dist/ssr';
import { createColumnHelper } from '@tanstack/react-table';
import {
   CircleDashedIcon,
   CircleDot,
   CircleDotIcon,
   CircleOff,
   EditIcon,
   HeartPulseIcon,
} from 'lucide-react';
import Image from 'next/image';

export type OfferData = Pick<
   OfferModel,
   'title' | 'imgSrc' | 'active' | 'approved' | 'items' | 'id'
>;

const columnHelper = createColumnHelper<DataTableFeatures, OfferData>();

export const columns = columnHelper.columns([
   columnHelper.accessor('imgSrc', {
      header: () => <div>Preview</div>,
      cell: ({ row: r }) => {
         const imgUrl = r.getValue('imgSrc') as string;

         return (
            <div className="flex items-center rounded-xl overfllow-clip s-20 justrify-center p-2 bg-white">
               <Image
                  src={imgUrl}
                  alt="preview"
                  width={96}
                  height={96}
                  className="w-[68px] h-auto object-cover rounded-md"
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
      sortFn: 'fuzzy',
   }),
   columnHelper.accessor('approved', {
      header: () => <div className="text-center">Approved</div>,
      cell: ({ row: r }) => {
         const approved = r.getValue('approved') as boolean;

         return (
            <div className="flex justify-center">
               {approved ? (
                  <Badge className="bg-green-50  text-green-700 dark:bg-green-950 dark:text-green-300 p-4">
                     <SealCheckIcon className="size-4!" /> Approved
                  </Badge>
               ) : (
                  <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 p-4">
                     <WarningIcon className="size-4!" /> Unapproved
                  </Badge>
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
                  <Badge className="bg-green-50  text-green-700 dark:bg-green-950 dark:text-green-300 p-4">
                     <PulseIcon className="size-4!" /> Active
                  </Badge>
               ) : (
                  <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 p-4">
                     <PauseIcon className="size-4!" /> Paused
                  </Badge>
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
         const quantity = Object.values(items)
            .map((i) => i.quantity)
            .reduce((a, b) => a + b, 0);

         return (
            <div className="text-center">
               {quantity ? (
                  <Badge variant={'ghost'}>{quantity}</Badge>
               ) : (
                  <Badge variant={'destructive'}>{quantity}</Badge>
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
               <EditOffer
                  offer={r.original}
                  trigger={
                     <Button variant={'ghost'}>
                        <EditIcon />
                     </Button>
                  }
               />
            </div>
         );
      },
      size: 40,
      minSize: 40,
   }),
]);
