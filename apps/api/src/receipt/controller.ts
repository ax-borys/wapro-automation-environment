import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

import type { Handler } from 'hono';
import type { ApiResponse, Config, Mapping } from '@wae/types';
import { generateReceipts, type GenerateReceiptInput } from '@wae/receipt';
import { dbWapro as db, recordReceipt } from '@wae/wapro';

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

   const receipts = generateReceipts(body, map, config);
   let results: { receiptNumber: string }[] = [];

   await db.transaction(async (tx) => {
      for (const receipt of receipts) {
         results.push(await recordReceipt(tx, receipt));
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
