import {
   EditFiscalNumberDialog,
   EditFiscalNumberDialogClose,
   EditFiscalNumberDialogContent,
   EditFiscalNumberDialogFooter,
   EditFiscalNumberDialogHeader,
   EditFiscalNumberDialogInput,
   EditFiscalNumberDialogSave,
   EditFiscalNumberDialogTitle,
   EditFiscalNumberDialogTrigger,
} from '@/components/ui/edit-fiscal-number-dialog';
import { ReceiptModel } from '@/entities/receipt';
import { Receipt } from '@wae/types';
import { EditIcon } from 'lucide-react';
import { useState } from 'react';

export function EditFiscalNumber({
   receiptId,
   trigger,
}: {
   receiptId: Receipt['id'];
   trigger: React.ReactElement;
}) {
   const [isOpen, setIsOpen] = useState<boolean>(false);

   const cancel = () => {
      setIsOpen(false);
   };
   const save = () => {
      setIsOpen(false);
   };

   return (
      <EditFiscalNumberDialog open={isOpen}>
         <EditFiscalNumberDialogTrigger asChild onClick={() => setIsOpen(true)}>
            {trigger}
         </EditFiscalNumberDialogTrigger>
         <EditFiscalNumberDialogContent
            onClose={cancel}
            onOpenAutoFocus={(e) => {
               e.preventDefault();
               (e.currentTarget as HTMLElement).focus();
            }}
            onKeyDown={(e) =>
               e.key === 'F10'
                  ? (e.preventDefault() ?? save())
                  : e.key === 'Escape' && cancel()
            }
         >
            <EditFiscalNumberDialogHeader>
               <EditFiscalNumberDialogTitle>
                  <EditIcon /> Edit fiscal number
               </EditFiscalNumberDialogTitle>
            </EditFiscalNumberDialogHeader>
            <EditFiscalNumberDialogInput />
            <EditFiscalNumberDialogFooter>
               <EditFiscalNumberDialogClose onClick={cancel} />
               <EditFiscalNumberDialogSave onClick={save} />
            </EditFiscalNumberDialogFooter>
         </EditFiscalNumberDialogContent>
      </EditFiscalNumberDialog>
   );
}
