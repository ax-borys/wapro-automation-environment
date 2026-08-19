import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

import type { Handler } from 'hono';
import type {
   ApiError,
   ApiResponse,
   Config,
   Mapping,
   RecordReceiptWapro as Receipt,
} from '@wae/types';
import { createReceipt } from '@wae/wapro-mag-create-receipt';
import { db } from '@wae/db';
import { generateReceipts, type GenerateReceiptInput } from '@wae/receipt';

const config: Config = {
   companyId: 1,
   cashRegisterId: 1,
   userId: 3000001,
   counterPartyId: 1,
   stockId: 1,
};

const map: Mapping = JSON.parse(
   fs.readFileSync(
      path.resolve(__dirname, '../../../../example_data/map.json'),
      'utf-8',
   ),
);

export const recordReceiptHandler: Handler = async (c) => {
   const body = await c.req.json<GenerateReceiptInput[]>();

   const receipts: Receipt[] = generateReceipts(body, map, config);
   let results: { receiptNumber: string }[] = [];

   await db.transaction(async (tx) => {
      for (const receipt of receipts) {
         results.push(await createReceipt(tx, receipt));
      }
   });

   return c.json<ApiResponse<{ receiptNumbers: string[] }>>(
      {
         data: {
            receiptNumbers: results.map((i) => i.receiptNumber),
         },
         error: null,
      },
      200,
   );
};
