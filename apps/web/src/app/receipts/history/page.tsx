import {
   ReceiptRecorded,
   ReceiptsDataTable,
} from '@/components/features/receipts-data-table';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';

async function getData(): Promise<ReceiptRecorded[]> {
   return [
      {
         buyerFirstName: 'Alex',
         buyerLastName: 'Borysiuk',
         packages: 1,
         number: 'P/0001/08/26',
         fiskalNumber: 'W038123',
         paymentMethod: 'PREPAID',
         total: 1600,
      },
      {
         buyerFirstName: 'Alex',
         buyerLastName: 'Borysiuk',
         packages: 1,
         number: 'P/0001/08/26',
         fiskalNumber: 'W038123',
         paymentMethod: 'PREPAID',
         total: 1600,
      },
      {
         buyerFirstName: 'Alex',
         buyerLastName: 'Borysiuk',
         packages: 1,
         number: 'P/0001/08/26',
         fiskalNumber: 'W038123',
         paymentMethod: 'PREPAID',
         total: 1600,
      },
   ];
}

export default async function ReceiptHistoryPage() {
   const data = await getData();

   return (
      <div className="">
         <ReceiptsDataTable data={data} />
      </div>
   );
}
