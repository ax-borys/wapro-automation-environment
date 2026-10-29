import { updateFiscalNumber } from '../api/update-fiscal-number';
import { useOrdersStore } from '../orders.store';
import { OrderModel } from '../types';
import { formatFiscalNumber } from '../utils/format-fiscal-number';

export function useUpdateFiscalNumber(orderId: OrderModel['id']) {
   const order = useOrdersStore((s) => s.orders[orderId]);

   const refreshReceipt = useOrdersStore((s) => s.refreshReceipt);

   return async (number: number) => {
      const originalReceipt = order.receipt.original;

      if (!originalReceipt) return;

      const formattedFiscalNumber = formatFiscalNumber(number);

      const receipt = await updateFiscalNumber({
         fiscalNumber: formattedFiscalNumber,
         id: originalReceipt.id,
      });

      refreshReceipt(order.id, {
         ...receipt,
         createdAt: new Date(receipt.createdAt),
      });

      return receipt;
   };
}
