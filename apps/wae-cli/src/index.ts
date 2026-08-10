import fs from 'fs';
import { db } from '@wae/db';
import { createReceipt } from '@wae/wapro-mag-create-receipt';

const receiptsData = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
console.log(receiptsData);

await db.transaction(async (tx) => {
   const receiptsParams: Parameters<typeof createReceipt>[1][] =
      receiptsData.map(
         (
            d: Omit<Parameters<typeof createReceipt>[1], 'paymentDeadline'> & {
               paymentDeadline: string;
            },
         ) => ({
            ...d,
            paymentDeadline: new Date(d.paymentDeadline),
         }),
      );

   const results = [];

   for (const p of receiptsParams) {
      results.push(await createReceipt(tx, p));
   }

   console.log('Operation succeeded./n', results);
});
