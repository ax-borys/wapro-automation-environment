import {
   Address,
   Customer,
   Delivery,
   Offer,
   Order,
   OrderPoisition,
   Receipt,
} from '@wae/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type PositionModel = Omit<OrderPoisition, 'clientTag' | 'receiptId'> & {
   offer: Offer;
};

export type OrderModel = Omit<Order, 'clientTag'> & {
   customer: Omit<Customer, 'clientTag'> & {
      address:
         | Omit<Address, 'clientTag' | 'orderId' | 'customerId'>
         | null
         | undefined;
   };
   delivery: Omit<Delivery, 'clientTag'> & {
      address: Omit<Address, 'clientTag'>;
   };
   positions: Record<PositionModel['offer']['id'], PositionModel>;
   receipt: Omit<Receipt, 'clientTag'> | null;
};

export type OrdersStore = {
   orders: Record<OrderModel['externalId'], OrderModel>;
   add: (order: OrderModel) => void;
   addMany: (orders: OrderModel[]) => void;
   remove: (orderId: OrderModel['externalId']) => void;
   addPosition: (
      orderId: OrderModel['externalId'],
      position: PositionModel,
   ) => void;
   removePosition: (
      orderId: OrderModel['externalId'],
      positionId: PositionModel['offer']['id'],
   ) => void;
};

export function normilizePositions(
   positionsArr: PositionModel[],
): Record<PositionModel['offer']['id'], PositionModel> {
   const position: Record<PositionModel['offer']['id'], PositionModel> = {};

   positionsArr.forEach((p) => (position[p.offer.id] = p));

   return position;
}

export const useOrdersStore = create<OrdersStore>()(
   immer((set, get) => ({
      orders: {},
      add: (order) =>
         set((draft) => {
            draft.orders[order.id] = order;
         }),
      addMany: (orders) =>
         set((draft) => {
            orders.forEach((order) => (draft.orders[order.id] = order));
         }),
      remove: (orderId) =>
         set((draft) => {
            delete draft.orders[orderId];
         }),
      addPosition: (orderId, position) =>
         set((draft) => {
            draft.orders[orderId].positions[position.offer.id] = position;
         }),
      removePosition: (orderId, positionId) =>
         set((draft) => {
            delete draft.orders[orderId].positions[positionId];
         }),
   })),
);
