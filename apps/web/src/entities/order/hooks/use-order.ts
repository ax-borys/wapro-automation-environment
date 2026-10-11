import { OrderModel, PositionModel, useOrdersStore } from '../orders.store';

export function useOrder(id: OrderModel['id']) {
   const store = useOrdersStore();

   return {
      order: store.orders[id],
      select: () => store.select(id),
      unselect: () => store.unselect(id),
      selectToggle: () => store.selectToggle(id),
      addPosition: (position: PositionModel) =>
         store.addPosition(String(id), position),
      removePosition: (positionId: PositionModel['offer']['id']) =>
         store.removePosition(String(id), positionId),
      setInvoiceNumber: (value: string) => store.setInvoiceNumber(id, value),
      changeInvoiceStatus: (value: OrderModel['invoice']['status']) =>
         store.changeInvoiceStatus(id, value),
   };
}
