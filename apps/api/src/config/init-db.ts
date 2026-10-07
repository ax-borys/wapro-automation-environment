import path from 'path';

import { runtimeError } from '@wae/core';
import { initDb } from '@wae/db';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pointing to the root of the package (application)
const __baseDirname = path.resolve(__dirname, '../../');

if (!process.env.DB_FILE_PATH) {
   throw runtimeError('DB_FILE_PATH is not provided.');
}

console.log('Path: ', path.resolve(__baseDirname, process.env.DB_FILE_PATH));

initDb(path.resolve(__baseDirname, process.env.DB_FILE_PATH));
