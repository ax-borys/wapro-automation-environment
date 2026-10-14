import { OrderModel, useOrdersStore } from '../orders.store';
import { changeRequiredDocumentType as changeRequiredDocumentTypeApi } from '../api/change-required-document-type';
import { errorModelSchema, useError } from '@/entities/error';

import * as v from 'valibot';

export function useChangeRequiredDocumentType(orderId: OrderModel['id']) {
   const { raiseError } = useError();
   const changeRequiredDocumentType = useOrdersStore(
      (s) => s.changeRequiredDocuemntType,
   );

   return async (requiredDocumentType: OrderModel['requiredDocumentType']) => {
      try {
         await changeRequiredDocumentTypeApi({ orderId, requiredDocumentType });
         changeRequiredDocumentType(orderId, requiredDocumentType);
      } catch (error) {
         const parsedError = v.safeParse(errorModelSchema, error);

         if (parsedError.success) {
            raiseError(parsedError.output);
         }
      }
   };
}
