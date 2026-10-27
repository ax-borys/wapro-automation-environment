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
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderModel, useUpdateFiscalNumber } from '@/entities/order';
import { Receipt } from '@wae/types';
import { EditIcon } from 'lucide-react';
import { ChangeEventHandler, useCallback, useState } from 'react';

export function UpdateFiscalNumber({
   orderId,
   trigger,
   defaultOpen = false,
   onClosed,
}: {
   orderId: OrderModel['id'];
   trigger?: React.ReactElement;
   defaultOpen?: boolean;
   onClosed?: () => void;
}) {
   const [fiscalNumber, setFiscalNumber] = useState<number | null>(null);
   const updateFiscalNumber = useUpdateFiscalNumber(orderId);

   const save = useCallback(async () => {
      if (!fiscalNumber) {
         return;
      }

      await updateFiscalNumber(fiscalNumber);
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
      <EditDialog
         onSave={save}
         onClosed={() => {
            setFiscalNumber(null);
            onClosed?.();
         }}
         defaultOpen={defaultOpen}
      >
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
