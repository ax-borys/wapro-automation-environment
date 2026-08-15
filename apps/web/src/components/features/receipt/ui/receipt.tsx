'use client';
import { Checkbox } from '@/components/ui/checkbox';
import {
   BadgePaid,
   BadgePickup,
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

export function Receipt() {
   const recordReceipts = useRecordReceipts();

   const recordReceiptsHandler: React.MouseEventHandler<
      HTMLButtonElement
   > = async () => {
      const result = await recordReceipts(data);
      console.log(result);
   };

   return (
      <>
         {data.map((order) => (
            <ReceiptCard key={order.orderId}>
               <ReceiptCardHeader>
                  <Checkbox />
                  <span className="font-medium underline">
                     Order #{order.orderId}
                  </span>
                  {order.paymentMethod === 'PREPAID' ? (
                     <BadgePaid />
                  ) : (
                     <BadgePickup />
                  )}
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
                  onActionClick={recordReceiptsHandler}
               />
            </ReceiptCard>
         ))}
      </>
   );
}
