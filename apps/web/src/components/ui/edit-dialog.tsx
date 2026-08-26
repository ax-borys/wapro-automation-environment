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

export function EditProductDialog(props: React.ComponentProps<typeof Dialog>) {
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
                  <EditIcon />
                  Edit product
               </DialogTitle>
            </DialogHeader>
            <DialogFooter>
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
