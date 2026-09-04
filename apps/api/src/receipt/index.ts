import {
   createReceiptInputSchema,
   createReceipts,
   GetReceiptOutput,
   getReceipts,
   getReceiptsInputSchema,
} from '@wae/receipt';
import { ApiResponse, WaproConfig } from '@wae/types';
import { Hono } from 'hono';
import { valibotJsonMiddleware } from '../helpers/valibot-middleware';
import * as v from 'valibot';
import { addOrderInputSchema, addOrders } from '@wae/order';

const config: WaproConfig = {
   companyId: 1,
   cashRegisterId: 1,
   userId: 3000001,
   counterPartyId: 1,
   stockId: 1,
};

export const receipt = new Hono()
   .post('/', valibotJsonMiddleware(getReceiptsInputSchema), async (c) => {
      const getReceiptsInput = c.req.valid('json');

      const receipts = await getReceipts(getReceiptsInput);

      return c.json<ApiResponse<GetReceiptOutput[]>>({
         data: receipts,
         error: null,
      });
   })
   .post(
      '/record',
      valibotJsonMiddleware(v.array(createReceiptInputSchema)),
      async (c) => {
         const input = c.req.valid('json');

         const receipts = await createReceipts(input, config);

         return c.json<ApiResponse<typeof receipts>>(
            {
               data: receipts,
               error: null,
            },
            200,
         );
      },
   );
