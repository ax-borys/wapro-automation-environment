import { ReceiptFeed } from '@/components/features/receipt-feed';
import { fetchMockPendingOrders } from '@/entities/order/fetch-mock-pending-orders';
import { fetchPendingOrders } from '@/entities/order/fetch-pending-orders';
import { ReceiptModel } from '@/entities/receipt';
import currency from 'currency.js';

export default async function AllegroOrdersPage() {
   return <ReceiptFeed initReceipts={[]} />;
}
