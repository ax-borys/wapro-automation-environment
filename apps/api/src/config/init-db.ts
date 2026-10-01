import { runtimeError } from '@wae/core';
import { initDb } from '@wae/db';

if (!process.env.DB_FILE_PATH) {
   throw runtimeError('DB_FILE_PATH is not provided.');
}

initDb(process.env.DB_FILE_PATH);
