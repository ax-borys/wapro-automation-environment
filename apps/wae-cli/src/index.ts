import fs from 'fs';
import { db } from '@wae/db';
import { createReceipt } from '@wae/wapro-mag-create-receipt';
import { closeConnection } from '@wae/db';

const commands: Record<string, (arg: string) => Promise<number | void>> = {
   'create-receipts': createReceiptsCommand,
};

async function createReceiptsCommand(arg: string) {
   if (!db) {
      return console.warn('Connection to data base is not established.');
   }
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

for (let i = 0; i < process.argv.length; i++) {
   const arg = process.argv[i];

   await commands[arg]?.(process.argv[i + 1]);
}

if (process.argv.length <= 2) {
   console.log('wae-cli [command] [args]\n');
   console.log('commands:');
   console.log('\tcreate-receipts: wae-cli create-receipts [PATH]');
}

await closeConnection();
