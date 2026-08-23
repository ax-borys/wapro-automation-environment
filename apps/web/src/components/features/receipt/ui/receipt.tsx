'use client';
import { Checkbox } from '@/components/ui/checkbox';
import {
   BadgeFiskalNumber,
   BadgePaid,
   BadgePickup,
   BadgeReceiptNumber,
   ReceiptCard,
   ReceiptCardBody,
   ReceiptCardFooter,
   ReceiptCardHeader,
   ReceiptCardTable,
   ReceiptCardTableBody,
   ReceiptCardTableFooter,
   ReceiptCardTableHeader,
   ReceiptCardTablePosition,
} from '@/components/ui/receipt-card';
import currency from 'currency.js';
import { Button } from '@/components/ui/button';
import {
   CashRegisterIcon,
   FloppyDiskIcon,
   ReceiptIcon,
   SpinnerIcon,
} from '@phosphor-icons/react';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import { useReceipt } from '@/entities/receipt/receipt.context';
import { recordReceipts } from '@/entities/receipt/record-receipts';
import { Order } from '@/entities/order';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DialogClose } from 'radix-ui/dialog';
import { SubmitEventHandler, useCallback } from 'react';
import { set } from 'date-fns';

async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

export function Receipt({ order }: { order: Order }) {
   const [receipt, setReceipt] = useReceipt(order.orderId.toString());
   const status = receipt.status;

   const setReceiptStatus = (status: typeof receipt.status) => {
      setReceipt((prev) => ({ ...prev, status }));
   };

   const test = () => {
      console.log(receipt);
   };

   test();

   const setReceiptFiscalNumber = useCallback(
      (fiscalNumber: typeof receipt.fiscalNumber) => {
         console.log({ ...receipt }, { ...order });
         setReceipt((prev) => ({ ...prev, fiscalNumber }));
      },
      [receipt.orderId, order.orderId],
   );

   const selected = receipt.selected as boolean;
   const toggleSelect = () => {
      setReceipt((prev) => ({
         ...prev,
         selected: receipt.selected ? false : true,
      }));
   };

   const number = receipt.number;
   const setNumber = (number: string) =>
      setReceipt((prev) => ({ ...prev, number }));

   const recordReceiptsHandler = async () => {
      setReceiptStatus('RECORDING');

      const fiscalNumber = receipt.fiscalNumber;
      if (!fiscalNumber) {
         return;
      }

      try {
         const result = await recordReceipts([{ ...order, fiscalNumber }]);
         console.log(order);

         if (result.error) {
            setReceiptStatus('RECORD');
            console.error(result.error);
            return;
         }

         const [receipt] = result.data;

         setReceiptStatus('RECORDED');
         setNumber(receipt.number);
      } catch (error) {
         console.error(error);
         setReceiptStatus('RECORD');
      }
   };

   const receiptNumberSubmitHandler: React.SubmitEventHandler<
      HTMLFormElement
   > = (e) => {
      e.preventDefault();
      const fiscalNumber = (
         e.target.elements.namedItem('fiscalNumber') as HTMLInputElement
      )?.value;

      const parsedFiscalNumber = Number.parseInt(fiscalNumber);

      if (parsedFiscalNumber) {
         setReceiptFiscalNumber(parsedFiscalNumber);
      } else if (fiscalNumber === '') {
         setReceiptFiscalNumber(null);
      } else if (fiscalNumber === '') {
      }
   };

   const copyToClipboard = (value: string) => {
      return navigator.clipboard.writeText(value);
   };

   return (
      <ReceiptCard className="">
         <ReceiptCardHeader>
            <Checkbox
               className="cursor-pointer"
               checked={selected}
               onCheckedChange={toggleSelect}
            />
            <span className="font-medium underline">
               Order #{order.orderId}
            </span>
            <div className="ml-auto flex gap-2 h-9">
               {status === 'RECORDED' ? (
                  <Button
                     onClick={() => copyToClipboard(number as string)}
                     className="bg-transparent hover:bg-transparent cursor-pointer px-0"
                  >
                     <BadgeReceiptNumber value={number as string} />
                  </Button>
               ) : null}
               {receipt.fiscalNumber ? (
                  <BadgeFiskalNumber
                     value={`W${String(receipt.fiscalNumber).padStart(6, '0')}`}
                  />
               ) : null}
               {order.paymentMethod === 'PREPAID' ? (
                  <BadgePaid />
               ) : (
                  <BadgePickup />
               )}
            </div>
         </ReceiptCardHeader>
         <ReceiptCardBody>
            <ReceiptCardTable>
               <ReceiptCardTableHeader />
               <ReceiptCardTableBody>
                  {order.positions.map((item, i) => (
                     <ReceiptCardTablePosition
                        key={order.orderId + item.externalId + i}
                        imgSrc={item.imgSrc}
                        name={item.title}
                        quantity={item.quantity}
                        tax="23"
                        net={currency(item.price).divide(1.23).value}
                        gross={currency(item.price).value}
                     />
                  ))}
               </ReceiptCardTableBody>
               <ReceiptCardTableFooter
                  totalNet={currency(order.totalPaid).divide(1.23).value}
                  totalGross={currency(order.totalPaid).value}
               />
            </ReceiptCardTable>
         </ReceiptCardBody>
         <ReceiptCardFooter
            buyerFullname={
               order.recipientFirstName + ' ' + order.recipientLastName
            }
            orderProcessedAt={order.orderProcessedAt}
         >
            <Dialog>
               <form
                  onSubmit={receiptNumberSubmitHandler}
                  id="set-fiscal-number-form"
               >
                  <DialogTrigger asChild>
                     <Button
                        variant={'outline'}
                        disabled={receipt.status !== 'RECORD'}
                     >
                        <CashRegisterIcon />
                     </Button>
                  </DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>Enter receipt's fiscal number</DialogTitle>
                     </DialogHeader>
                     <DialogDescription>
                        Make sure you are writing correct fiscal number.
                     </DialogDescription>
                     <FieldGroup>
                        <Field>
                           <Label>Fiscal number</Label>
                           <Input
                              autoFocus={true}
                              name="fiscalNumber"
                              form="set-fiscal-number-form"
                           />
                        </Field>
                     </FieldGroup>
                     <DialogFooter className="-m-6 p-6 py-4 mt-0 bg-sidebar rounded-b-xl border-t border-border">
                        <DialogClose asChild>
                           <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                           <Button type="submit" form="set-fiscal-number-form">
                              Save changes
                           </Button>
                        </DialogClose>
                     </DialogFooter>
                  </DialogContent>
               </form>
            </Dialog>
            {status === 'RECORD' ? (
               <Button
                  onClick={recordReceiptsHandler}
                  disabled={receipt.fiscalNumber ? false : true}
               >
                  <ReceiptIcon />
                  Record a receipt
               </Button>
            ) : status === 'RECORDING' ? (
               <Button variant={'secondary'} disabled>
                  <Marker role="status">
                     <MarkerIcon className="animate-spin">
                        <SpinnerIcon />
                     </MarkerIcon>
                     <MarkerContent className="shimmer">
                        Recording
                     </MarkerContent>
                  </Marker>
               </Button>
            ) : (
               <Button variant={'outline'}>
                  <Marker role="status">
                     <MarkerIcon>
                        <FloppyDiskIcon />
                     </MarkerIcon>
                     <MarkerContent>Recorded</MarkerContent>
                  </Marker>
               </Button>
            )}
         </ReceiptCardFooter>
      </ReceiptCard>
   );
}
