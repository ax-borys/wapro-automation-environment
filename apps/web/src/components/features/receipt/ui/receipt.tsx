'use client';
import { Checkbox } from '@/components/ui/checkbox';
import {
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
   FloppyDiskIcon,
   ReceiptIcon,
   SpinnerIcon,
} from '@phosphor-icons/react';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import { useReceipt } from '@/entities/receipt/receipt.context';
import { recordReceipts } from '@/entities/receipt/record-receipts';
import { Order } from '@/entities/order';

async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

export function Receipt({ order }: { order: Order }) {
   const [receipt, setReceipt] = useReceipt(order.orderId.toString());
   const status = receipt.status;
   const setReceiptStatus = (status: typeof receipt.status) => {
      setReceipt((prev) => ({ ...prev, status }));
   };

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

      try {
         const result = await recordReceipts([order]);
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
                     className="bg-transparent hover:bg-transparent cursor-pointer"
                  >
                     <BadgeReceiptNumber value={number as string} />
                  </Button>
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
            {status === 'RECORD' ? (
               <Button onClick={recordReceiptsHandler}>
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
