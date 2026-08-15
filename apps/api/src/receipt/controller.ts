import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import type { Handler } from 'hono';
import type { Config, Mapping, Receipt } from '@wae/types';
import fs from 'fs';
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
   const body: { receipts: GenerateReceiptInput[] } = await c.req.json();
   const receipts: Receipt[] = generateReceipts(body.receipts, map, config);
   console.log('catch');

   try {
      let result = null;
      await db.transaction(async (tx) => {
         for (const receipt of receipts) {
            console.log(receipt);
            result = await createReceipt(tx, receipt);
         }
      });

      return c.json(result, 200);
   } catch (error) {
      return c.json({ err: error }, 400);
   }
};
