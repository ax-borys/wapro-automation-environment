import fs from 'fs';
import { recordReceipt, dbWapro as db } from '@wae/wapro';
import { closeConnection } from '@wae/wapro';
import { Config, Mapping, Order } from '@wae/types';
import { generateReceipts } from './commands/generate-receipts';

const commands: Record<string, (...args: string[]) => void | Promise<void>> = {
   'create-receipts': createReceiptsCommand,
   'generate-receipts': generateReceiptsCommand,
};

const config: Config = {
   companyId: 1,
   cashRegisterId: 1,
   userId: 3000001,
   counterPartyId: 1,
   stockId: 1,
};

function generateReceiptsCommand(
   pathToOrdersData: string,
   pathToMappingObj: string,
) {
   const orders: Order[] = JSON.parse(
      fs.readFileSync(pathToOrdersData, 'utf-8'),
   );
   const map: Mapping = JSON.parse(fs.readFileSync(pathToMappingObj, 'utf-8'));

   const receipts = generateReceipts(orders, map, config);
   const jsonReceiptsData = JSON.stringify(receipts, null, 3);

   process.stdout.write(jsonReceiptsData);
}

async function createReceiptsCommand(arg: string) {
   if (!db) {
      return console.warn('Connection to data base is not established.');
   }
   const receiptsData = JSON.parse(fs.readFileSync(arg, 'utf-8'));

   await db.transaction(async (tx) => {
      const receiptsParams: Parameters<typeof recordReceipt>[1][] =
         receiptsData.map(
            (
               d: Omit<
                  Parameters<typeof recordReceipt>[1],
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
         results.push(await recordReceipt(tx, p));
      }

      console.log('Operation succeeded.');
      console.log(results);
   });
}

for (let i = 0; i < process.argv.length; i++) {
   const arg = process.argv[i];

   await commands[arg]?.(...process.argv.splice(i + 1));
}

if (process.argv.length <= 2) {
   console.log('wae-cli [command] [args]\n');
   console.log('commands:');
   console.log('\tcreate-receipts: wae-cli create-receipts [PATH]');
   console.log(
      '\t\tcreating receipts in data base based on provided json file representing receipts\n',
   );
   console.log(
      '\tgenerate-receipts: wae-cli generate-receipts [PATH-TO-ORDERS] [PATH-TO-MAP]',
   );
   console.log(
      '\t\tgenerate receipts from orders and require path to map of erp store and offerts',
   );
   console.log('\nCreated by Olek');
}

await closeConnection();
