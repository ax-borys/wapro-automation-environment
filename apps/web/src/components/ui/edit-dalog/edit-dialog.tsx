'use client';
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogDescription,
} from '../dialog';
import { cn } from '@/lib/utils';
import { Kbd } from '../kbd';
import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import {
   EditDialogHandlersProvider,
   useEditDialogHandlers,
} from './model/edit-dialog-context';

export function EditDialog({
   children,
   onCancel,
   onSave,
}: {
   onCancel?: () => void;
   onSave?: () => void;
   children: React.ReactNode;
}) {
   const [open, setOpen] = useState<boolean>(false);

   const handlers = {
      onSave: new Proxy(onSave ?? (() => {}), {
         apply: (target, thisArg, args) => {
            const result = Reflect.apply(target, thisArg, args);

            setOpen(false);

            return result;
         },
      }),

      onCancel: new Proxy(onCancel ?? (() => {}), {
         apply: (target, thisArg, args) => {
            const result = Reflect.apply(target, thisArg, args);

            console.log('Cancel');
            setOpen(false);

            return result;
         },
      }),

      onOpen: () => setOpen(true),
   };

   useEffect(() => {
      if (!open) return;

      const keyHandler = async (e: KeyboardEvent) => {
         switch (e.key) {
            case 'F10':
               e.preventDefault();
               handlers.onSave();
               break;
            case 'Escape':
               handlers.onCancel();
         }
      };

      window.addEventListener('keydown', keyHandler, { capture: true });

      return () =>
         window.removeEventListener('keydown', keyHandler, { capture: true });
   }, [open, onSave, onCancel]);

   return (
      <EditDialogHandlersProvider value={handlers}>
         <Dialog open={open}>{children}</Dialog>
      </EditDialogHandlersProvider>
   );
}

export function EditDialogTrigger({
   ...props
}: React.ComponentProps<typeof DialogTrigger>) {
   const [{ onOpen }] = useEditDialogHandlers();

   return <DialogTrigger onClick={() => onOpen?.()} {...props} />;
}

export function EditDialogHeader({
   children,
   ...props
}: React.ComponentProps<typeof DialogHeader>) {
   return <DialogHeader {...props}>{children}</DialogHeader>;
}

export function EditDialogTitle({
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

export function EditDialogDescription({
   className,
   ...props
}: React.ComponentProps<typeof DialogDescription>) {
   return <DialogDescription className={cn(className)} {...props} />;
}

export function EditDialogContent({
   ...props
}: React.ComponentProps<typeof DialogContent>) {
   return <DialogContent {...props} />;
}

export function EditDialogFooter({
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

export function EditDialogCancel({
   className,
   children,
   ...props
}: React.ComponentProps<typeof Button>) {
   const [{ onCancel }] = useEditDialogHandlers();

   return (
      <DialogClose asChild>
         <Button
            tabIndex={-1}
            className={cn('', className)}
            variant={'outline'}
            onClick={onCancel}
            {...props}
         >
            Cancel<Kbd>Esc</Kbd>
         </Button>
      </DialogClose>
   );
}

export function EditDialogSave({
   className,
   children,
   ...props
}: React.ComponentProps<typeof Button>) {
   const [{ onSave }] = useEditDialogHandlers();
   return (
      <DialogClose asChild>
         <Button
            tabIndex={-1}
            className={cn('', className)}
            onClick={onSave}
            {...props}
         >
            Save<Kbd>F10</Kbd>
         </Button>
      </DialogClose>
   );
}
