import { ReceiptFeed } from '@/components/features/receipt-feed';
import { type Receipt } from '@/entities/receipt/receipt.context';
import { Order, OrdersProvider } from '@/entities/order';
import { ReceiptModel } from '@/entities/receipt';
import currency from 'currency.js';

const data: Order[] = [
   {
      paymentMethod: 'PREPAID',
      packagesMade: 1,
      recipientFirstName: 'Alex',
      recipientLastName: 'Borysiuk',
      totalPaid: 25000,
      orderId: 1,
      positions: [
         {
            externalId: '1',
            price: 25000,
            quantity: 1,
            title: 'Geforce RTX 5090',
            imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
         },
      ],
      orderProcessedAt: new Date().toDateString(),
   },
   {
      paymentMethod: 'PREPAID',
      packagesMade: 1,
      recipientFirstName: 'Alex',
      recipientLastName: 'Borysiuk',
      totalPaid: 6000,
      orderId: 2,
      positions: [
         {
            externalId: '2',
            price: 6000,
            quantity: 1,
            title: 'Geforce RTX 5080',
            imgSrc: 'http://localhost:8082/public/rtx5080.png',
         },
      ],
      orderProcessedAt: new Date().toDateString(),
   },
   {
      paymentMethod: 'PREPAID',
      packagesMade: 1,
      recipientFirstName: 'Alex',
      recipientLastName: 'Borysiuk',
      totalPaid: 4500,
      orderId: 3,
      positions: [
         {
            externalId: '3',
            price: 4500,
            quantity: 1,
            title: 'Geforce RTX 5070',
            imgSrc: 'http://localhost:8082/public/rtx5070.jpg',
         },
      ],
      orderProcessedAt: new Date().toDateString(),
   },
   {
      paymentMethod: 'PREPAID',
      packagesMade: 1,
      recipientFirstName: 'Alex',
      recipientLastName: 'Borysiuk',
      totalPaid: 20000,
      orderId: 4,
      positions: [
         {
            externalId: '4',
            price: 20000,
            quantity: 1,
            title: 'Geforce RTX 5080 x3 SET',
            imgSrc: 'http://localhost:8082/public/rtx5080x3.png',
         },
      ],
      orderProcessedAt: new Date().toDateString(),
   },
   {
      paymentMethod: 'PREPAID',
      packagesMade: 1,
      recipientFirstName: 'Alex',
      recipientLastName: 'Borysiuk',
      totalPaid: 9000,
      orderId: 5,
      positions: [
         {
            externalId: '3',
            price: 4500,
            quantity: 2,
            title: 'Geforce RTX 5070',
            imgSrc: 'http://localhost:8082/public/rtx5070.jpg',
         },
      ],
      orderProcessedAt: new Date().toDateString(),
   },
   {
      paymentMethod: 'PREPAID',
      packagesMade: 1,
      recipientFirstName: 'Alex',
      recipientLastName: 'Borysiuk',
      totalPaid: 40000,
      orderId: 6,
      positions: [
         {
            externalId: '4',
            price: 20000,
            quantity: 2,
            title: 'Geforce RTX 5080 x3 SET',
            imgSrc: 'http://localhost:8082/public/rtx5080x3.png',
         },
      ],
      orderProcessedAt: new Date().toDateString(),
   },
   {
      paymentMethod: 'PREPAID',
      packagesMade: 1,
      recipientFirstName: 'Alex',
      recipientLastName: 'Borysiuk',
      totalPaid: currency(19182.23).multiply(2).value,
      orderId: 7,
      positions: [
         {
            externalId: '4',
            price: 19182.23,
            quantity: 2,
            title: 'Geforce RTX 5080 x3 SET',
            imgSrc: 'http://localhost:8082/public/rtx5080x3.png',
         },
      ],
      orderProcessedAt: new Date().toDateString(),
   },
];

export default function AllegroOrdersPage() {
   const initReceipts = data.map((d) => {
      const receipt: ReceiptModel = {
         orderId: d.orderId.toString(),
         status: 'RECORD',
         selected: false,
      };

      return receipt;
   });

   return (
      <OrdersProvider value={data}>
         <ReceiptFeed initReceipts={initReceipts} />
      </OrdersProvider>
   );
}
