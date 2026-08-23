import { ReceiptFeed } from '@/components/features/receipt-feed';
import { type Receipt } from '@/entities/receipt/receipt.context';
import { Order, OrdersProvider } from '@/entities/order';

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
      totalPaid: 25000,
      orderId: 2,
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
      totalPaid: 25000,
      orderId: 3,
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
      totalPaid: 25000,
      orderId: 4,
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
];

export default function AllegroOrdersPage() {
   const initReceipts = data.map((d) => {
      const receipt: Receipt = {
         orderId: d.orderId.toString(),
         status: 'RECORD',
         selected: false,
      };

      return receipt;
   });

   return (
      <OrdersProvider value={data}>
         <main className="mx-auto min-w-full bg-background">
            <ReceiptFeed initReceipts={initReceipts} />
         </main>
      </OrdersProvider>
   );
}
