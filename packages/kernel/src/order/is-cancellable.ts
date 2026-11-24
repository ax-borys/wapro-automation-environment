import { Order } from '@wae/types';

export type OrderInfo = Pick<Order, 'status'>;

export function isCancellable(orderInfo: OrderInfo) {
   const { status } = orderInfo;

   if (status === 'FULFILLED' || status === 'CANCELLED') {
      return false;
   }

   return true;
}
