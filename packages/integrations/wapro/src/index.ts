export {
   type CreateReceiptInput as RecordReceiptInput,
   type ReceiptPosition,
   type CreateReceiptOutput as RecordReceiptOutput,
} from './services/record-receipts';

export { createReceipt as recordReceipt } from './services/record-receipts';

export { closeConnection, type Db as WaproDb } from './db';
export {
   db as dbWapro,
   createDb as createWaproDb,
   initDb as initWaproDb,
} from './db';

export { getProducts } from './services/get-products';
export { WaproError } from './errors';
