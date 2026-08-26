import {
   ReceiptRecorded,
   ReceiptsDataTable,
} from '@/components/widgets/receipts-data-table';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { fetchReceipts } from '@/entities/receipt';

export default async function ReceiptHistoryPage() {
   const response = await fetchReceipts();

   return (
      <div className="flex flex-col min-h-0 h-full">
         <ReceiptsDataTable initialData={response.data || []} />
      </div>
   );
}
