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
import { DialogClose } from 'radix-ui/dialog';
import { useReceipt } from '@/entities/receipt';

async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

export function Receipt({ order }: { order: Order }) {
   const { receipt, changeStatus, setNumber, setFiscalNumber, selectToggle } =
      useReceipt(order.orderId.toString(), {
         orderId: order.orderId.toString(),
         status: 'RECORD',
      });

   const { number, status, fiscalNumber, selected } = receipt;

   const recordReceiptsHandler = async () => {
      changeStatus('RECORDING');

      const fiscalNumber = receipt.fiscalNumber;
      if (!fiscalNumber) {
         return;
      }

      try {
         const [receipt] = await recordReceipts([{ ...order, fiscalNumber }]);
         console.log(order);

         changeStatus('RECORDED');
         setNumber(receipt.number);
      } catch (error) {
         console.error(error);
         changeStatus('RECORD');
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
         setFiscalNumber(parsedFiscalNumber);
      } else if (fiscalNumber === '') {
         setFiscalNumber(null);
      } else if (fiscalNumber === '') {
      }
   };

   const copyToClipboard = (value: string) => {
      return navigator.clipboard.writeText(value);
   };

   return (
      <ReceiptCard className="flex h-fit">
         <ReceiptCardHeader>
            <Checkbox
               className="cursor-pointer"
               checked={selected}
               onCheckedChange={selectToggle}
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
               {fiscalNumber ? (
                  <BadgeFiskalNumber
                     value={`W${String(fiscalNumber).padStart(6, '0')}`}
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
                  id={`set-fiscal-number-form-#${receipt.orderId}`}
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
                              form={`set-fiscal-number-form-#${receipt.orderId}`}
                           />
                        </Field>
                     </FieldGroup>
                     <DialogFooter className="-m-6 p-6 py-4 mt-0 bg-sidebar rounded-b-xl border-t border-border">
                        <DialogClose asChild>
                           <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                           <Button
                              type="submit"
                              form={`set-fiscal-number-form-#${receipt.orderId}`}
                           >
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
                  disabled={fiscalNumber ? false : true}
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
