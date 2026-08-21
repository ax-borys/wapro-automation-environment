import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { relations } from './schemas/receipt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({
   path: envPath,
   quiet: true,
});

const dbPath =
   'file:' + path.resolve(__dirname, `../../../${process.env.DB_FILENAME}`);
console.log('Path: ', dbPath);

export const db = drizzle(dbPath, { relations });

export {
   receiptsTable,
   offersTable,
   itemsTable,
   productsTable,
   positionsTable,
} from './schemas/receipt';
