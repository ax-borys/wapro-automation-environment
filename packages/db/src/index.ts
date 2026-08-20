import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-mssql';
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

export const db = drizzle(
   'file:' + path.resolve(__dirname, `../../../../${process.env.DB_FILENAME}`),
   { relations },
);
