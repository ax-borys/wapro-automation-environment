import { drizzle } from 'drizzle-orm/libsql';
import path from 'node:path';
import { relations } from './schemas';

export const createDb = (pathToDbFile: string) =>
   drizzle('file:' + path.resolve(__dirname, pathToDbFile), { relations });

export type Db = ReturnType<typeof createDb>;

let instance: Db | null = null;

export const initDb = (pathToDbFile: string) => {
   if (instance) return instance;

   instance = createDb(pathToDbFile);

   return instance;
};

// Hack to prevent exported db to be possible null
export const db = new Proxy({} as Db, {
   get(_, property, receiver) {
      if (!instance) {
         throw new Error('Database is not initialized.');
      }

      const value = Reflect.get(instance, property, receiver);

      if (typeof value === 'function') {
         return value.bind(instance);
      }

      return value;
   },
});

export {
   receiptsTable,
   offersTable,
   itemsTable,
   productsTable,
   positionsTable,
   customersTable,
   addressesTable,
   ordersTable,
   deliveriesTable,
   recipientsTable,
   invoicesTable,
} from './schemas';
