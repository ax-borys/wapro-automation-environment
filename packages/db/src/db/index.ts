import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({
   path: envPath,
});

import { drizzle } from 'drizzle-orm/node-mssql';

if (!process.env.DATABASE_URL) {
   throw new Error('DATABASE_URL is not set');
}

export const db = drizzle(process.env.DATABASE_URL!);
