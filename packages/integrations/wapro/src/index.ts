export {
   type CreateReceiptInput as RecordReceiptInput,
   type ReceiptPosition,
   type CreateReceiptOutput as RecordReceiptOutput,
} from './services/record-receipts';

export { createReceipt as recordReceipt } from './services/record-receipts';

export { closeConnection } from './db';
export { db as dbWapro } from './db';

export { getProducts } from './services/get-products';
