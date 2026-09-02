import { ReceiptFeed } from '@/components/features/receipt-feed';
import { fetchMockPendingOrders } from '@/entities/order/fetch-mock-pending-orders';
import { fetchPendingOrders } from '@/entities/order/fetch-pending-orders';
import { ReceiptModel } from '@/entities/receipt';
import currency from 'currency.js';

export default async function AllegroOrdersPage() {
   const pendingOrders = await fetchMockPendingOrders();

   const initReceipts: ReceiptModel[] = pendingOrders.map((order) => ({
      orderId: order.externalId,
      status: 'RECORD',
   }));

   return <ReceiptFeed initReceipts={initReceipts} />;
}
