import type { Handler } from 'hono';
import type { ApiResponse, WaproConfig } from '@wae/types';
import {
   createReceipts,
   GetReceiptOutput,
   getReceipts,
   GetReceiptsInput,
   type CreateReceiptInput,
} from '@wae/receipt';
import { createFactory } from 'hono/factory';

const config: WaproConfig = {
   companyId: 1,
   cashRegisterId: 1,
   userId: 3000001,
   counterPartyId: 1,
   stockId: 1,
};

const factory = createFactory();
const createHandlers = factory.createHandlers.bind(factory);

export const recordReceiptsHandler = factory.createHandlers(async (c) => {
   const createReceiptsInput = await c.req.json<CreateReceiptInput[]>();

   const receipts = await createReceipts(createReceiptsInput, config);

   return c.json<ApiResponse<typeof receipts>>(
      {
         data: receipts,
         error: null,
      },
      200,
   );
});

export const getReceiptsHandler = factory.createHandlers(async (c) => {
   const getReceiptsInput = await c.req.json<GetReceiptsInput>();

   const receipts = await getReceipts(getReceiptsInput);

   return c.json<ApiResponse<GetReceiptOutput[]>>({
      data: receipts,
      error: null,
   });
});
