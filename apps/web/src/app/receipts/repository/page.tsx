import { ReceiptsDataTable } from '@/components/widgets/receipts-data-table';

export default async function ReceiptHistoryPage() {
   return (
      <div className="flex flex-col min-h-0 h-full">
         <ReceiptsDataTable initialData={[]} />
      </div>
   );
}
