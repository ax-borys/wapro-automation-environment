import fs from 'fs';
import { db } from '@wae/db';
import { createReceipt } from '@wae/wapro-mag-create-receipt';

const commands: Record<string, (arg: string) => Promise<number | void>> = {
   'create-receipts': createReceiptsCommand,
};

async function createReceiptsCommand(arg: string) {
   const receiptsData = JSON.parse(fs.readFileSync(arg, 'utf-8'));

   await db.transaction(async (tx) => {
      const receiptsParams: Parameters<typeof createReceipt>[1][] =
         receiptsData.map(
            (
               d: Omit<
                  Parameters<typeof createReceipt>[1],
                  'paymentDeadline'
               > & {
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

      console.log('Operation succeeded.');
      console.log(results);
   });
}

process.argv.forEach((arg: string, i, arr) => {
   commands[arg]?.(arr[i + 1]);
});
