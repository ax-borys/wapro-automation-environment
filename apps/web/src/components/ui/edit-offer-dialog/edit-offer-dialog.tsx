import { OfferModel } from '@/entities/offer';
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '../dialog';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '../item';
import { LinkIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '../button';

type OfferData = Pick<OfferModel, 'title' | 'imgSrc'>;

export function EditOfferDialog({
   children,
   ...props
}: React.ComponentProps<typeof Dialog>) {
   return <Dialog {...props}>{children}</Dialog>;
}

export function EditOfferDialogTrigger({
   ...props
}: React.ComponentProps<typeof DialogTrigger>) {
   return <DialogTrigger {...props} />;
}

export function EditOfferDialogHeader({
   children,
   ...props
}: React.ComponentProps<typeof DialogHeader>) {
   return <DialogHeader {...props}>{children}</DialogHeader>;
}

export function EditOfferDialogTitle({
   children,
   className,
   ...props
}: React.ComponentProps<typeof DialogTitle>) {
   return (
      <DialogTitle
         className={cn('flex items-center gap-2 text-lg', className)}
         {...props}
      >
         {children}
      </DialogTitle>
   );
}

export function EditOfferDialogContent({
   ...props
}: React.ComponentProps<typeof DialogContent>) {
   return <DialogContent {...props} />;
}

export function EditOfferDialogObject({
   title,
   imgSrc,
}: {
   title: string;
   imgSrc: string;
}) {
   return (
      <div className="flex object-cover w-full h-auto items-center gap-6">
         <Image
            src={imgSrc}
            width={50}
            height={50}
            className="size-12.5"
            alt="Product preview"
         />
         <span className="text-lg font-medium">{title}</span>
      </div>
   );
}

export function EditOfferDialogProducts({
   className,
   ...props
}: React.ComponentProps<'div'>) {
   return (
      <div
         className={cn('w-full flex flex-col gap-6 min-w-0', className)}
         {...props}
      />
   );
}

export function EditOfferDialogProduct({
   name,
   quantity,
}: {
   name: OfferModel['items'][number]['name'];
   quantity: OfferModel['items'][number]['quantity'];
}) {
   return (
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
                  {name}
               </span>
               <span className="flex items-center mx-4 gap-1">
                  <XIcon className="size-3!" /> {quantity}
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
   );
}

export function EditOfferDialogFooter({
   className,
   children,
   ...props
}: React.ComponentProps<typeof DialogFooter>) {
   return (
      <DialogFooter
         className={cn(
            '-mx-6 px-6 -mb-6 py-6 rounded-b-xl border-t border-border bg-muted/50',
            className,
         )}
         {...props}
      >
         {children}
      </DialogFooter>
   );
}

export function EditOfferDialogEmptyProducts() {
   return (
      <span className="ml-4 text-muted-foreground font-medium">
         No linked products.
      </span>
   );
}

export const EditOfferDialogClose = DialogClose;
