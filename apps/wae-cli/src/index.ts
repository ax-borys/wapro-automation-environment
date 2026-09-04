import fs from 'fs';
import { recordReceipt, dbWapro as db } from '@wae/wapro';
import { closeConnection } from '@wae/wapro';
import { WaproConfig, Mapping, Order } from '@wae/types';
import { getAllOffers } from './commands/get-all-offers';
import { syncOffers } from './commands/sync-offers';
import { getPendingOrders } from '@wae/allegro';
import { syncProducts } from './commands/sync-products';
import { convertImgSrcToS128b } from './commands/convertImgSrcToS128b';

const commands: Record<string, (...args: string[]) => void | Promise<void>> = {
   'create-receipts': createReceiptsCommand,
   'get-all-offers': getAllOffersCommand,
   'sync-offers': syncOffersCommand,
   'get-pending-orders': getPendingOrdersCommand,
   'sync-products': syncProductsCommand,
   'convert-imgs': convertImgSrcCommnd,
};

async function convertImgSrcCommnd() {
   const result = await convertImgSrcToS128b();
   process.stdout.write(JSON.stringify(result, null, 3));
}

const config: WaproConfig = {
   companyId: 1,
   cashRegisterId: 1,
   userId: 3000001,
   counterPartyId: 1,
   stockId: 1,
};

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

async function getAllOffersCommand() {
   const offers = await getAllOffers();
   process.stdout.write(JSON.stringify(offers, null, 3));
}

async function syncOffersCommand() {
   const offers = await syncOffers();
   console.log(offers);
   process.stdout.write(JSON.stringify(offers, null, 3));
}

async function getPendingOrdersCommand() {
   const orders = await getPendingOrders();
   process.stdout.write(JSON.stringify(orders, null, 3));
}

async function syncProductsCommand() {
   const products = await syncProducts();
   process.stdout.write(JSON.stringify(products, null, 3));
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
