import { runtimeError } from '@wae/core';
import { initWaproDb } from '@wae/wapro';

if (!process.env.DB_HOST) {
   throw runtimeError('DB_HOST is not provided.');
}

if (!process.env.DB_USER) {
   throw runtimeError('DB_USER is not provided.');
}

if (!process.env.DB_PASSWORD) {
   throw runtimeError('DB_PASSWORD is not provided.');
}

if (!process.env.DB_NAME) {
   throw runtimeError('DB_NAME is not provided.');
}

await initWaproDb({
   server: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
});
