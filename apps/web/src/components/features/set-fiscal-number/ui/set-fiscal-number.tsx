import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog';
import {
   EditDialog,
   EditDialogCancel,
   EditDialogContent,
   EditDialogDescription,
   EditDialogFooter,
   EditDialogHeader,
   EditDialogSave,
   EditDialogTrigger,
} from '@/components/ui/edit-dalog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderModel, useFiscalNumber, useOrdersStore } from '@/entities/order';
import { CashRegisterIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';

export function SetFiscalNumber({
   orderId,
   onFiscalNumberSet,
}: {
   orderId: OrderModel['id'];
   onFiscalNumberSet?: (value: number) => void;
}) {
   const fiscalNumber = useFiscalNumber(orderId);
   const status = useOrdersStore((s) => s.getStatus)(orderId);
   const setDraftFiscalNumber = useOrdersStore(
      (s) => s.setDraftFiscalNumber,
   ).bind(null, orderId);

   const [fiscalNumberInput, setFiscalNumberInput] = useState<string>('');

   const submitFiscalNumber = useCallback(() => {
      setDraftFiscalNumber(Number(fiscalNumberInput));
      onFiscalNumberSet?.(Number(fiscalNumberInput));
   }, [fiscalNumberInput, setDraftFiscalNumber]);

   return (
      <EditDialog
         onSave={submitFiscalNumber}
         onClosed={() => setFiscalNumberInput('')}
      >
         <EditDialogTrigger asChild>
            <Button
               variant={fiscalNumber ? 'outline' : 'default'}
               disabled={status !== 'RECORD'}
            >
               <CashRegisterIcon />
            </Button>
         </EditDialogTrigger>
         <EditDialogContent>
            <EditDialogHeader>
               <DialogTitle>Enter receipt's fiscal number</DialogTitle>
            </EditDialogHeader>
            <EditDialogDescription>
               Make sure you are writing correct fiscal number.
            </EditDialogDescription>
            <FieldGroup>
               <Field>
                  <Label>Fiscal number</Label>
                  <Input
                     autoFocus={true}
                     value={fiscalNumberInput}
                     onChange={(e) => {
                        if (Number.isInteger(Number(e.target.value))) {
                           setFiscalNumberInput(e.target.value);
                        }
                     }}
                  />
               </Field>
            </FieldGroup>
            <EditDialogFooter className="-m-6 p-6 py-4 mt-0 bg-sidebar rounded-b-xl border-t border-border">
               <EditDialogCancel />
               <EditDialogSave />
            </EditDialogFooter>
         </EditDialogContent>
      </EditDialog>
   );
}
