export {
   type CreateReceiptInput as RecordReceiptInput,
   type ReceiptPosition,
   type CreateReceiptReturn as RecordReceiptReturn,
} from './services/record-receipts';

export { createReceipt as recordReceipt } from './services/record-receipts';

export { closeConnection } from './db';
export { db as dbWapro } from './db';
