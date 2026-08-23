import type { Handler } from 'hono';
import type { ApiResponse, Config } from '@wae/types';
import { createReceipts, type CreateReceiptInput } from '@wae/receipt';

const config: Config = {
   companyId: 1,
   cashRegisterId: 1,
   userId: 3000001,
   counterPartyId: 1,
   stockId: 1,
};

export const recordReceiptHandler: Handler = async (c) => {
   const createReceiptsInput = await c.req.json<CreateReceiptInput[]>();

   const receipts = await createReceipts(createReceiptsInput, config);

   return c.json<ApiResponse<typeof receipts>>(
      {
         data: receipts,
         error: null,
      },
      200,
   );
};
