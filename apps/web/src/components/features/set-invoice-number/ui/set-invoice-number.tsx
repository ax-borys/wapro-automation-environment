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
import { OrderModel, useInvoiceNumber, useOrdersStore } from '@/entities/order';
import { InvoiceIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';

export function SetInvoiceNumber({ orderId }: { orderId: OrderModel['id'] }) {
   const invoiceNumber = useInvoiceNumber(orderId);
   const status = useOrdersStore((s) => s.getStatus)(orderId);
   const setDraftInvoiceNumber = useOrdersStore(
      (s) => s.setDraftInvoiceNumber,
   ).bind(null, orderId);

   const [invoiceNumberInput, setInvoiceNumberInput] = useState<string>('');

   const submitFiscalNumber = useCallback(() => {
      setDraftInvoiceNumber(invoiceNumberInput);
   }, [invoiceNumberInput, setDraftInvoiceNumber]);

   return (
      <EditDialog
         onSave={submitFiscalNumber}
         onClosed={() => setInvoiceNumberInput('')}
      >
         <EditDialogTrigger asChild>
            <Button
               variant={invoiceNumber ? 'outline' : 'default'}
               disabled={status !== 'RECORD'}
            >
               <InvoiceIcon />
            </Button>
         </EditDialogTrigger>
         <EditDialogContent>
            <EditDialogHeader>
               <DialogTitle>Enter invoice number</DialogTitle>
            </EditDialogHeader>
            <EditDialogDescription>
               Make sure you are writing correct invoice number.
            </EditDialogDescription>
            <FieldGroup>
               <Field>
                  <Label>Invoice number</Label>
                  <Input
                     autoFocus={true}
                     value={invoiceNumberInput}
                     onChange={(e) => {
                        setInvoiceNumberInput(e.target.value);
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
