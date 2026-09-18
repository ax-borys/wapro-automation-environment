import {
   Address,
   Customer,
   Delivery,
   Item,
   Offer,
   Order,
   OrderPoisition,
   Product,
   Receipt,
   Recipient,
} from '@wae/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { OfferModel, ProductModel } from '../offer';

export type PositionModel = Omit<OrderPoisition, 'clientTag' | 'receiptId'> & {
   offer: OfferModel;
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
   recipient: Omit<Recipient, 'clientTag' | 'addressId'>;
   selected: boolean;
};

export type OrdersStore = {
   orders: Record<OrderModel['externalId'], OrderModel>;
   add: (order: OrderModel) => void;
   addMany: (orders: OrderModel[]) => void;
   remove: (orderId: OrderModel['externalId']) => void;
   select: (id: OrderModel['id']) => void;
   unselect: (id: OrderModel['id']) => void;
   selectMany: (ids: OrderModel['id'][]) => void;
   unselectMany: (ids: OrderModel['id'][]) => void;
   selectAll: () => void;
   unselectAll: () => void;
   selectToggle: (id: OrderModel['id']) => void;
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
      select: (id) =>
         set((s) => {
            s.orders[id].selected = true;
         }),
      unselect: (id) =>
         set((s) => {
            s.orders[id].selected = false;
         }),
      selectToggle: (id) =>
         set((s) => {
            s.orders[id].selected = !s.orders[id].selected;
         }),
      selectMany: (ids) =>
         set((s) => {
            ids.forEach((id) => (s.orders[id].selected = true));
         }),
      unselectMany: (ids) =>
         set((s) => {
            ids.forEach((id) => (s.orders[id].selected = false));
         }),
      selectAll: () =>
         set((s) => {
            Object.values(s.orders).forEach((receipt) => {
               receipt.selected = true;
            });
         }),
      unselectAll: () =>
         set((s) => {
            Object.values(s.orders).forEach((receipt) => {
               receipt.selected = false;
            });
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
