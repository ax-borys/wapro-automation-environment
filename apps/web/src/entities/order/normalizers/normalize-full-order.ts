import { FullOrder } from '@wae/types';

export function normalizeFullOrder(
   order: Omit<FullOrder, 'createdAt' | 'preparedAt' | 'fulfilledAt'> & {
      createdAt: string;
      fulfilledAt: string;
      preparedAt: string;
   },
): FullOrder {
   return {
      ...order,
      createdAt: new Date(order.createdAt),
      preparedAt: new Date(order.preparedAt),
      fulfilledAt: new Date(order.fulfilledAt),
   };
}
