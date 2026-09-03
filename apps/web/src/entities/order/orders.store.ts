import { Customer, Offer, Order, OrderPoisition } from '@wae/types';
import { Portal } from 'radix-ui';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type PositionModel = Omit<
   OrderPoisition,
   'clientTag' | 'receiptId' | 'offerId'
> & {
   offer: Offer;
};

export type OrderModel = Order & {
   customer: Customer;
   positions: Record<PositionModel['offer']['id'], PositionModel>;
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
            draft.orders[order.externalId] = order;
         }),
      addMany: (orders) =>
         set((draft) => {
            orders.forEach((order) => (draft.orders[order.externalId] = order));
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
