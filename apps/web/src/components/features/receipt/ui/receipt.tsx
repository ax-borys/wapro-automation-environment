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
import { GenerateReceiptInput } from '@wae/receipt';
import currency from 'currency.js';
import { useRecordReceipts } from '../model/record-receipt.hook';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
   FloppyDiskIcon,
   ReceiptIcon,
   SpinnerIcon,
} from '@phosphor-icons/react';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import { Separator } from '@/components/ui/separator';

const data: (GenerateReceiptInput & {
   orderId: string;
   imgSrc: string;
   name: string;
   buyerFullname: string;
   orderProcessedAt: string;
})[] = [
   {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '1',
            price: 25000,
            quantity: 1,
         },
      ],
      total: 25000,
      imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
      orderProcessedAt: new Date().toDateString(),
      orderId: '1324',
      buyerFullname: 'Alex Borysiuk',
      name: 'Geforce RTX 5090',
   },
];

async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

export function Receipt() {
   const [receiptStatus, setReceiptStatus] = useState<
      'RECORDED' | 'RECORDING' | 'RECORD'
   >('RECORD');
   const [number, setNumber] = useState<string>('');

   const recordReceipts = useRecordReceipts();

   const recordReceiptsHandler: React.MouseEventHandler<
      HTMLButtonElement
   > = async () => {
      setReceiptStatus('RECORDING');

      try {
         const result = await recordReceipts(data);

         if (result.error) {
            setReceiptStatus('RECORD');
            console.error(result.error);
            return;
         }

         setReceiptStatus('RECORDED');
         setNumber(result.data.receiptNumbers[0]);
      } catch (error) {
         console.error(error);
         setReceiptStatus('RECORD');
      }
   };

   const copyToClipboard = (value: string) => {
      return navigator.clipboard.writeText(value);
   };

   return (
      <>
         <Separator />
         {data.map((order) => (
            <Fragment key={order.orderId}>
               <ReceiptCard>
                  <ReceiptCardHeader>
                     <Checkbox />
                     <span className="font-medium underline">
                        Order #{order.orderId}
                     </span>
                     <div className="ml-auto flex gap-2">
                        {receiptStatus === 'RECORDED' ? (
                           <Button
                              onClick={() => copyToClipboard(number)}
                              className="bg-transparent hover:bg-transparent cursor-pointer"
                           >
                              <BadgeReceiptNumber value={number} />
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
                           {order.items.map((item, i) => (
                              <ReceiptCardTablePosition
                                 key={order.orderId + item.offerId + i}
                                 imgSrc={order.imgSrc}
                                 name={order.name}
                                 quantity={item.quantity}
                                 tax="23"
                                 net={currency(item.price).divide(1.23).value}
                                 gross={currency(item.price).value}
                              />
                           ))}
                        </ReceiptCardTableBody>
                        <ReceiptCardTableFooter
                           totalNet={currency(order.total).divide(1.23).value}
                           totalGross={currency(order.total).value}
                        />
                     </ReceiptCardTable>
                  </ReceiptCardBody>
                  <ReceiptCardFooter
                     buyerFullname={order.buyerFullname}
                     orderProcessedAt={order.orderProcessedAt}
                  >
                     {receiptStatus === 'RECORD' ? (
                        <Button onClick={recordReceiptsHandler}>
                           <ReceiptIcon />
                           Record a receipt
                        </Button>
                     ) : receiptStatus === 'RECORDING' ? (
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
               <Separator />
            </Fragment>
         ))}
      </>
   );
}
