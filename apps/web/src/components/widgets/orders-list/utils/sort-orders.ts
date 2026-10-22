import { OrderModel } from '@/entities/order';

const isRecorded = (order: OrderModel) =>
   order.invoice.original || order.receipt.original;

export const sortOrders = (a: OrderModel, b: OrderModel) => {
   const recordedDiff = Number(isRecorded(a)) - Number(isRecorded(b));

   if (recordedDiff !== 0) {
      return recordedDiff; // not recorded (0) first, recorded (1) last
   }

   return a.original.preparedAt.getTime() - b.original.preparedAt.getTime();
};
