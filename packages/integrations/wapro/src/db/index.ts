import mssql from 'mssql';
import { drizzle } from 'drizzle-orm/node-mssql';

type DbOptions = {
   server: string;
   user: string;
   password: string;
   database: string;
};

export let closeConnection: () => void = () => {};

export const createDb = async ({
   server,
   user,
   password,
   database,
}: DbOptions) => {
   const pool = await mssql.connect({
      server,
      user,
      password,
      database,
      options: {
         encrypt: false,
         trustServerCertificate: true,
      },
      requestTimeout: 120_000,
      connectionTimeout: 60_000,
   });

   closeConnection = () => pool.close();

   return drizzle({ client: pool });
};

export type Db = Awaited<ReturnType<typeof createDb>>;

let instance: Db | null;

export const initDb = async (options: DbOptions) => {
   if (instance) return instance;

   instance = await createDb(options);

   return instance;
};

// Hack to prevent exported db to be possible null
export const db = new Proxy({} as Db, {
   get(_, property, receiver) {
      if (!instance) {
         throw new Error('Wapro database is not initialized.');
      }

      const value = Reflect.get(instance, property, receiver);

      if (typeof value === 'function') {
         return value.bind(instance);
      }

      return value;
   },
});
