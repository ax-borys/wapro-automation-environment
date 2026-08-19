import { ReceiptFeed } from '@/components/features/receipt-feed';
import { GenerateReceiptInput } from '@wae/receipt';
import { type Receipt } from '@/entities/receipt/receipt.context';
import { OrdersProvider } from '@/entities/order';

const data: (Omit<GenerateReceiptInput, 'items'> & {
   orderId: string;
   items: (GenerateReceiptInput['items'][number] & { name: string; imgSrc: string })[];
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
            name: 'Geforce RTX 5090',
            imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
         },
      ],
      total: 25000,
      
      orderProcessedAt: new Date().toDateString(),
      orderId: '1',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'POSTPAID',
      items: [
         {
            offerId: '2',
            price: 6000,
            quantity: 1,
            name: 'Geforce RTX 5080',
            imgSrc: 'http://localhost:8082/public/rtx5080.png',
         },
      ],
      total: 6000,
  
      orderProcessedAt: new Date().toDateString(),
      orderId: '2',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '1',
            price: 20000,
            quantity: 1,
            name: 'Geforce RTX 5090',
            imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
         },
         {
            offerId: '2',
            price: 6000,
            quantity: 2,
            name: 'Geforce RTX 5080',
            imgSrc: 'http://localhost:8082/public/rtx5080.png',
         },
      ],
      total: 32000,

      orderProcessedAt: new Date().toDateString(),
      orderId: '3',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '4',
            price: 20000,
            quantity: 1,
            name: 'Geforce RTX 5080 X3 SET',
            imgSrc: 'http://localhost:8082/public/rtx5080x3.png',
         }
      ],
      total: 20000,

      orderProcessedAt: new Date().toDateString(),
      orderId: '4',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'PREPAID',
      items: [
                  {
            offerId: '4',
            price: 20000,
            quantity: 2,
            name: 'Geforce RTX 5080 X3 SET',
            imgSrc: 'http://localhost:8082/public/rtx5080x3.png',
         },
         {
            offerId: '2',
            price: 6000,
            quantity: 1,
            name: 'Geforce RTX 5080',
            imgSrc: 'http://localhost:8082/public/rtx5080.png',
         },
      ],
      total: 46000,
      orderProcessedAt: new Date().toDateString(),
      orderId: '5',
      buyerFullname: 'Alex Borysiuk',
   },
    {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '1',
            price: 25000,
            quantity: 1,
            name: 'Geforce RTX 5090',
            imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
         },
      ],
      total: 25000,
      
      orderProcessedAt: new Date().toDateString(),
      orderId: '6',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'POSTPAID',
      items: [
         {
            offerId: '2',
            price: 6000,
            quantity: 1,
            name: 'Geforce RTX 5080',
            imgSrc: 'http://localhost:8082/public/rtx5080.png',
         },
      ],
      total: 6000,
  
      orderProcessedAt: new Date().toDateString(),
      orderId: '7',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '1',
            price: 20000,
            quantity: 1,
            name: 'Geforce RTX 5090',
            imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
         },
         {
            offerId: '2',
            price: 6000,
            quantity: 2,
            name: 'Geforce RTX 5080',
            imgSrc: 'http://localhost:8082/public/rtx5080.png',
         },
      ],
      total: 32000,

      orderProcessedAt: new Date().toDateString(),
      orderId: '8',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '4',
            price: 20000,
            quantity: 1,
            name: 'Geforce RTX 5080 X3 SET',
            imgSrc: 'http://localhost:8082/public/rtx5080x3.png',
         }
      ],
      total: 20000,

      orderProcessedAt: new Date().toDateString(),
      orderId: '9',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'PREPAID',
      items: [
                  {
            offerId: '4',
            price: 20000,
            quantity: 2,
            name: 'Geforce RTX 5080 X3 SET',
            imgSrc: 'http://localhost:8082/public/rtx5080x3.png',
         },
         {
            offerId: '2',
            price: 6000,
            quantity: 1,
            name: 'Geforce RTX 5080',
            imgSrc: 'http://localhost:8082/public/rtx5080.png',
         },
      ],
      total: 46000,
      orderProcessedAt: new Date().toDateString(),
      orderId: '10',
      buyerFullname: 'Alex Borysiuk',
   },
];

export default function AllegroOrdersPage() {
   const initReceipts = data.map((d) => {
      const receipt: Receipt = {
         orderId: d.orderId,
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
