import { useOrdersStore } from '../orders.store';
import { OrderModel, PositionModel } from '../types';

export function useOrder(id: OrderModel['id']) {
   const order = useOrdersStore((s) => s.orders[id]);
   const select = useOrdersStore((s) => s.select);
   const unselect = useOrdersStore((s) => s.unselect);
   const selectToggle = useOrdersStore((s) => s.selectToggle);
   const addPosition = useOrdersStore((s) => s.addPosition);
   const removePosition = useOrdersStore((s) => s.removePosition);
   const setDraftFiscalNumber = useOrdersStore((s) => s.setDraftFiscalNumber);
   const setDraftInvoiceNumber = useOrdersStore((s) => s.setDraftInvoiceNumber);
   const getStatus = useOrdersStore((s) => s.getStatus);

   return {
      order: order,
      get status() {
         return getStatus(id);
      },
      select: () => select(id),
      unselect: () => unselect(id),
      selectToggle: () => selectToggle(id),
      addPosition: (position: PositionModel) => addPosition(id, position),
      removePosition: (positionId: PositionModel['offer']['id']) =>
         removePosition(id, positionId),
      setDraftFiscalNumber: (value: string) => setDraftFiscalNumber(id, value),
      setDraftInvoiceNumber: (value: string) =>
         setDraftInvoiceNumber(id, value),
   };
}
