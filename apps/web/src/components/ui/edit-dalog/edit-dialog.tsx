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
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../button';
import {
   EditDialogHandlersProvider,
   useEditDialogHandlers,
} from './model/edit-dialog-context';
import { Slot } from 'radix-ui';

export function EditDialog({
   children,
   onCancel,
   onSave,
   defaultOpen = false,
}: {
   onCancel?: () => void;
   onSave?: () => void;
   children: React.ReactNode;
   defaultOpen?: boolean;
}) {
   const [open, setOpen] = useState<boolean>(defaultOpen);

   const handlers = useMemo(
      () => ({
         onSave: new Proxy(onSave ?? (() => {}), {
            apply: (target, thisArg, args) => {
               const result = Reflect.apply(target, thisArg, args);

               setOpen(false);
               console.log('Save');

               return result;
            },
         }),

         onCancel: new Proxy(onCancel ?? (() => {}), {
            apply: (target, thisArg, args) => {
               const result = Reflect.apply(target, thisArg, args);

               setOpen(false);

               return result;
            },
         }),

         onOpen: () => setOpen(true),
      }),
      [setOpen, onCancel, onSave],
   );

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
   onClose,
   ...props
}: React.ComponentProps<typeof DialogContent>) {
   const [{ onCancel: cancelHandler }] = useEditDialogHandlers();

   return (
      <DialogContent
         onClose={() => {
            cancelHandler?.();
            onClose?.();
         }}
         {...props}
      />
   );
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
   asChild,
   onClick,
   ...props
}: React.ComponentProps<typeof Button>) {
   const [{ onCancel }] = useEditDialogHandlers();

   const Comp = asChild ? Slot.Root : Button;

   return (
      <DialogClose asChild>
         <Comp
            tabIndex={-1}
            className={cn('', className)}
            {...(!asChild ? { variant: 'outline' as const } : {})}
            {...props}
            onClick={(e) => {
               onCancel?.();
               onClick?.(e);
            }}
         >
            {asChild ? (
               children
            ) : (
               <>
                  Cancel<Kbd>Esc</Kbd>
               </>
            )}
         </Comp>
      </DialogClose>
   );
}

export function EditDialogSave({
   className,
   children,
   asChild,
   onClick,
   ...props
}: React.ComponentProps<typeof Button>) {
   const [{ onSave }] = useEditDialogHandlers();

   const Comp = asChild ? Slot.Root : Button;

   return (
      <DialogClose asChild>
         <Comp
            tabIndex={-1}
            className={cn('', className)}
            {...props}
            onClick={(e) => {
               onSave?.();
               onClick?.(e);
            }}
         >
            {asChild ? (
               children
            ) : (
               <>
                  Save<Kbd>F10</Kbd>
               </>
            )}
         </Comp>
      </DialogClose>
   );
}
