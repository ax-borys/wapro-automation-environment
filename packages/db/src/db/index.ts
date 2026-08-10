import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-mssql';

export const db = drizzle(process.env.DATABASE_URL!);
