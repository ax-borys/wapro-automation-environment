import { updateFiscalNumber } from '../api/update-fiscal-number';
import { useOrdersStore } from '../orders.store';
import { OrderModel } from '../types';
import { formatFiscalNumber } from '../utils/format-fiscal-number';

export function useUpdateFiscalNumber(orderId: OrderModel['id']) {
   const isOrderStored = useOrdersStore((s) => !!s.orders[orderId]);
   const refreshReceipt = useOrdersStore((s) => s.refreshReceipt).bind(
      null,
      orderId,
   );

   return async (number: number) => {
      const formattedFiscalNumber = formatFiscalNumber(number);

      const receipt = await updateFiscalNumber({
         fiscalNumber: formattedFiscalNumber,
         id: orderId,
      });

      if (isOrderStored) {
         refreshReceipt({ ...receipt, createdAt: new Date(receipt.createdAt) });
      }

      return receipt;
   };
}
