import { EditIcon } from 'lucide-react';
import { Button } from './button';
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from './dialog';
import React from 'react';
import { OfferModel } from '@/entities/offer';
import Image from 'next/image';
import { Separator } from './separator';
import { LinkIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from './item';

type OfferData = {
   imgSrc: OfferModel['imgSrc'];
   title: OfferModel['title'];
};

export function EditProductDialog({
   offer,
   ...props
}: React.ComponentProps<typeof Dialog> & { offer: OfferData }) {
   return (
      <Dialog {...props}>
         <DialogTrigger asChild>
            <Button variant={'outline'}>
               <EditIcon />
            </Button>
         </DialogTrigger>
         <DialogContent showCloseButton={false}>
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-lg">
                  <EditIcon /> Add products
               </DialogTitle>
            </DialogHeader>
            <div className="flex object-cover w-full h-auto items-center gap-6">
               <Image
                  src={offer.imgSrc}
                  width={50}
                  height={50}
                  className="size-12.5"
                  alt="Product preview"
               />
               <span className="text-lg font-medium">{offer.title}</span>
            </div>
            <Separator />
            <div className="w-full flex flex-col gap-6 min-w-0">
               <Item
                  size={'xs'}
                  variant={'outline'}
                  className="bg-secondary/50 text-primary/80 min-w-0 w-full"
               >
                  <ItemMedia variant={'icon'}>
                     <LinkIcon />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                     <ItemTitle className="flex min-w-0 justify-between w-full">
                        <span className="border-b border-primary/80 border-dashed truncate min-w-0 cursor-pointer">
                           Geforce RTX 5090
                        </span>
                        <span className="flex items-center mx-4 gap-1">
                           <XIcon className="size-3!" /> 1
                        </span>
                     </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                     <Button
                        variant={'ghost'}
                        className="hover:text-destructive hover:bg-destructive/5"
                     >
                        <TrashIcon />
                     </Button>
                  </ItemActions>
               </Item>
               <Separator />
               <Button variant={'outline'} className="w-fit">
                  <PlusIcon /> Add product
               </Button>
            </div>
            <DialogFooter className="-mx-6 px-6 -mb-6 py-6 rounded-b-xl border-t border-border bg-muted/50">
               <DialogClose asChild>
                  <Button variant={'outline'}>Cancel</Button>
               </DialogClose>
               <DialogClose asChild>
                  <Button>Save</Button>
               </DialogClose>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
