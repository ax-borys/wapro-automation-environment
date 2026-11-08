import { mkdtempSync, rmSync } from 'node:fs';
import { filePath, initDb } from '..';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { reset } from 'drizzle-seed';
import * as schema from '../schemas';
import { isTable } from 'drizzle-orm';

const tables = Object.values(schema).filter(isTable);

const DB_FILENAME = 'vitest.test.db';
const migrationsFolder = resolve(import.meta.dirname, '../drizzle/');

export function useTestDb() {
   let dir: string | null = null;
   let db: ReturnType<typeof initDb> | null = null;
   let testFilePath: string | null;

   beforeAll(async () => {
      dir = mkdtempSync(join(tmpdir(), 'vitest-test-db-'));
      testFilePath = join(dir, DB_FILENAME);

      db = initDb(testFilePath);

      if (filePath !== testFilePath) {
         throw new Error(
            'Refuse to perform actions on non-testing database. Database has been initialized before.',
         );
      }

      await migrate(db, { migrationsFolder });
   });

   beforeEach(async () => {
      if (!db) throw new Error('Database is not initialized.');

      if (filePath !== testFilePath) {
         throw new Error(
            'Refuse to perform actions on non-testing database. Database has been initialized before.',
         );
      }

      await reset(db, tables);
   });

   afterAll(async () => {
      db?.$client.close();

      if (dir) {
         rmSync(dir, { force: true, recursive: true });
      }
   });
}
