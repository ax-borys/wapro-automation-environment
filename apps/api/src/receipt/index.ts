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

const recordReceiptInputSchema = v.object({
   receipt: createReceiptInputSchema,
   order: addOrderInputSchema,
});

type Test = v.InferInput<typeof recordReceiptInputSchema>;

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
      valibotJsonMiddleware(v.array(recordReceiptInputSchema)),
      async (c) => {
         const input = c.req.valid('json');

         const orders = await addOrders(input.map((i) => i.order));
         const receipts = await createReceipts(
            input.map((i) => i.receipt),
            config,
         );

         return c.json<ApiResponse<typeof receipts>>(
            {
               data: receipts,
               error: null,
            },
            200,
         );
      },
   );
