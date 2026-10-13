import { OrdersDataTable } from '@/components/widgets/orders-data-table';

export default async function ReceiptHistoryPage() {
   return (
      <div className="flex flex-col min-h-0 h-full">
         <OrdersDataTable initialData={[]} />
      </div>
   );
}
