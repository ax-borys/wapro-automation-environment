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
import { db } from '@wae/db';
import { fulfillOrders } from '@wae/order';

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
      valibotJsonMiddleware(
         v.pipe(v.array(createReceiptInputSchema), v.nonEmpty()),
      ),
      async (c) => {
         const input = c.req.valid('json');

         const receipts = await db.transaction(async (tx) => {
            const receipts = await createReceipts(tx, input, config);

            await fulfillOrders(
               tx,
               receipts.map((receipt) => ({ id: receipt.orderId })),
            );

            return receipts;
         });

         return c.json<ApiResponse<typeof receipts>>(
            {
               data: receipts,
               error: null,
            },
            200,
         );
      },
   );
