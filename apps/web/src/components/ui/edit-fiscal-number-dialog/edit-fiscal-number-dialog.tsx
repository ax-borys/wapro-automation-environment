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
import {
   Item,
   ItemActions,
   ItemContent,
   ItemHeader,
   ItemMedia,
   ItemTitle,
} from '../item';
import {
   ArrowsVerticalIcon,
   LinkIcon,
   TrashIcon,
   TruckIcon,
   XIcon,
} from '@phosphor-icons/react';
import { Button } from '../button';
import {
   Combobox,
   ComboboxContent,
   ComboboxEmpty,
   ComboboxInput,
   ComboboxItem,
   ComboboxList,
} from '../combobox';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';
import { Kbd } from '../kbd';
import { Input } from '../input';
import React from 'react';
import { FieldGroup, Field } from '../field';
import { Label } from '../label';

export function EditFiscalNumberDialog({
   children,
   ...props
}: React.ComponentProps<typeof Dialog>) {
   return <Dialog {...props}>{children}</Dialog>;
}

export function EditFiscalNumberDialogTrigger({
   ...props
}: React.ComponentProps<typeof DialogTrigger>) {
   return <DialogTrigger {...props} />;
}

export function EditFiscalNumberDialogHeader({
   children,
   ...props
}: React.ComponentProps<typeof DialogHeader>) {
   return <DialogHeader {...props}>{children}</DialogHeader>;
}

export function EditFiscalNumberDialogTitle({
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

export function EditFiscalNumberDialogContent({
   ...props
}: React.ComponentProps<typeof DialogContent>) {
   return <DialogContent {...props} />;
}

export function EditFiscalNumberDialogInput({
   className,
   ...props
}: React.ComponentProps<typeof Input>) {
   return (
      <FieldGroup>
         <Field>
            <Label>Fiscal number</Label>
            <Input className={cn('', className)} {...props} />
         </Field>
      </FieldGroup>
   );
}

export function EditFiscalNumberDialogFooter({
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

export function EditFiscalNumberDialogClose({
   className,
   children,
   ...props
}: React.ComponentProps<typeof Button>) {
   return (
      <DialogClose asChild>
         <Button
            tabIndex={-1}
            className={cn('', className)}
            variant={'outline'}
            {...props}
         >
            Cancel<Kbd>Esc</Kbd>
         </Button>
      </DialogClose>
   );
}

export function EditFiscalNumberDialogSave({
   className,
   children,
   ...props
}: React.ComponentProps<typeof Button>) {
   return (
      <DialogClose asChild>
         <Button tabIndex={-1} className={cn('', className)} {...props}>
            Save<Kbd>F10</Kbd>
         </Button>
      </DialogClose>
   );
}
