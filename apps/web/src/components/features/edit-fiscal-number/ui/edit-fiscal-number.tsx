import {
   EditFiscalNumberDialog,
   EditFiscalNumberDialogClose,
   EditFiscalNumberDialogContent,
   EditFiscalNumberDialogDescription,
   EditFiscalNumberDialogFooter,
   EditFiscalNumberDialogHeader,
   EditFiscalNumberDialogInput,
   EditFiscalNumberDialogSave,
   EditFiscalNumberDialogTitle,
   EditFiscalNumberDialogTrigger,
} from '@/components/ui/edit-fiscal-number-dialog';
import { formatFiscalNumber, updateFiscalNumber } from '@/entities/receipt';
import { Receipt } from '@wae/types';
import { EditIcon } from 'lucide-react';
import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';

export function EditFiscalNumber({
   receiptId,
   trigger,
   defaultOpen = false,
   onClose,
}: {
   receiptId: Receipt['id'];
   trigger?: React.ReactElement;
   defaultOpen?: boolean;
   onClose?: () => void;
}) {
   const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
   const [fiscalNumber, setFiscalNumber] = useState<number | null>(null);

   const cancel = useCallback(() => {
      setIsOpen(false);
      setTimeout(() => setFiscalNumber(null), 100);
      onClose?.();
   }, [setFiscalNumber]);

   const save = useCallback(async () => {
      if (!fiscalNumber) {
         return;
      }

      await updateFiscalNumber({
         id: receiptId,
         fiscalNumber: formatFiscalNumber(fiscalNumber),
      });

      setIsOpen(false);
      setTimeout(() => setFiscalNumber(null), 100);
      onClose?.();
   }, [fiscalNumber]);

   const onChangeFiscalNumberHander: ChangeEventHandler<HTMLInputElement> = (
      e,
   ) => {
      const value = Number(e.target.value);

      if (isNaN(value)) {
         return;
      }

      setFiscalNumber(value);
   };

   useEffect(() => {
      if (!isOpen) return;

      const keyHandler = async (e: KeyboardEvent) => {
         switch (e.key) {
            case 'F10':
               e.preventDefault();
               await save();
               break;
            case 'Escape':
               cancel();
         }
      };

      window.addEventListener('keydown', keyHandler, { capture: true });

      return () =>
         window.removeEventListener('keydown', keyHandler, { capture: true });
   }, [isOpen, save, cancel]);

   return (
      <EditFiscalNumberDialog open={isOpen}>
         <EditFiscalNumberDialogTrigger asChild onClick={() => setIsOpen(true)}>
            {trigger}
         </EditFiscalNumberDialogTrigger>
         <EditFiscalNumberDialogContent onClose={cancel}>
            <EditFiscalNumberDialogHeader>
               <EditFiscalNumberDialogTitle>
                  <EditIcon /> Edit fiscal number
               </EditFiscalNumberDialogTitle>
            </EditFiscalNumberDialogHeader>
            <EditFiscalNumberDialogDescription>
               Please, make sure you are writing correct fiscal number.
            </EditFiscalNumberDialogDescription>
            <EditFiscalNumberDialogInput
               value={fiscalNumber ?? ''}
               onChange={onChangeFiscalNumberHander}
            />
            <EditFiscalNumberDialogFooter>
               <EditFiscalNumberDialogClose onClick={cancel} />
               <EditFiscalNumberDialogSave onClick={save} />
            </EditFiscalNumberDialogFooter>
         </EditFiscalNumberDialogContent>
      </EditFiscalNumberDialog>
   );
}
