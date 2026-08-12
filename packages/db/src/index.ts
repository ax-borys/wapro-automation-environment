import { db } from './db';

export async function health_check() {
   try {
      await db?.execute('SELECT 1');
      console.log('Database is alive!');
   } catch (err) {
      console.log('Database is dead!/n', err);
   }
}

export function test() {
   return 'tst';
}

export { db };
export { closeConnection } from './db';
