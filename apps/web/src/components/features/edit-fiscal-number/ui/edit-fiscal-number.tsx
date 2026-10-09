import {
   EditDialog,
   EditDialogCancel,
   EditDialogContent,
   EditDialogDescription,
   EditDialogFooter,
   EditDialogHeader,
   EditDialogSave,
   EditDialogTitle,
   EditDialogTrigger,
} from '@/components/ui/edit-dalog';
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
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatFiscalNumber, updateFiscalNumber } from '@/entities/receipt';
import { cn } from '@/lib/utils';
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
   const [fiscalNumber, setFiscalNumber] = useState<number | null>(null);

   const cancel = useCallback(() => {
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

   return (
      <EditDialog onSave={save} onCancel={cancel} defaultOpen={defaultOpen}>
         <EditDialogTrigger asChild>{trigger}</EditDialogTrigger>
         <EditDialogContent>
            <EditDialogHeader>
               <EditDialogTitle>
                  <EditIcon /> Edit fiscal number
               </EditDialogTitle>
            </EditDialogHeader>
            <EditDialogDescription>
               Please, make sure you are writing correct fiscal number.
            </EditDialogDescription>
            <FieldGroup>
               <Field>
                  <Label>Fiscal number</Label>
                  <Input
                     value={fiscalNumber ?? ''}
                     onChange={onChangeFiscalNumberHander}
                  />
               </Field>
            </FieldGroup>
            <EditDialogFooter>
               <EditDialogCancel />
               <EditDialogSave />
            </EditDialogFooter>
         </EditDialogContent>
      </EditDialog>
   );
}
