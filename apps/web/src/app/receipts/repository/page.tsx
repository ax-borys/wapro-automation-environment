import { ReceiptsDataTable } from '@/components/widgets/receipts-data-table';
import { fetchReceipts } from '@/entities/receipt';

export default async function ReceiptHistoryPage() {
   const receipts = await fetchReceipts();

   return (
      <div className="flex flex-col min-h-0 h-full">
         <ReceiptsDataTable
            initialData={receipts.map((i) => ({
               ...i,
               createdAt: new Date(i.createdAt),
            }))}
         />
      </div>
   );
}
