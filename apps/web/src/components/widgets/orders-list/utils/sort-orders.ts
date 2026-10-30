import { OrderModel } from '@/entities/order';

const isRecorded = (order: OrderModel): boolean =>
   Boolean(order.invoice.original || order.receipt.original);

export const sortOrders = (a: OrderModel, b: OrderModel) => {
   const aRecorded = isRecorded(a);
   const bRecorded = isRecorded(b);

   if (aRecorded !== bRecorded) return aRecorded ? 1 : -1; // recorded last

   return a.original.preparedAt.getTime() - b.original.preparedAt.getTime();
};
