import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

const file = path.resolve(process.env.DB_FILE_PATH);
const client = createClient({ url: 'file:' + file });

const one = async (sql) => (await client.execute(sql)).rows;

console.log('size MB:', (fs.statSync(file).size / 1024 / 1024).toFixed(2));
console.log('integrity_check:', await one('PRAGMA integrity_check'));
console.log('foreign_key_check:', await one('PRAGMA foreign_key_check'));
console.log('journal_mode:', await one('PRAGMA journal_mode'));
console.log(
   'page_count / freelist_count:',
   await one('PRAGMA page_count'),
   await one('PRAGMA freelist_count'),
);
