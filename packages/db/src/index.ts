import { db } from './db';

export async function health_check() {
   try {
      await db?.execute('SELECT 1');
      console.log('Database is alive!');
   } catch (err) {
      console.log('Database is dead!/n', err);
   }
}

export { db };
export { closeConnection, sqliteDb } from './db';
export { offersTable, type Offer, type OfferInput } from './db/schema';
