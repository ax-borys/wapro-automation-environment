import { createPersistentStore, type StateStorage } from '@wae/allegro';
import { runtimeError } from '@wae/core';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';

if (!process.env.ALLEGRO_CLIENT_ID) {
   throw runtimeError('ALLEGRO_CLIENT_ID is not provided.');
}

if (!process.env.ALLEGRO_CLIENT_SECRET) {
   throw runtimeError('ALLEGRO_CLIENT_SECRET is not provided.');
}

if (!process.env.ALLEGRO_DEVICE_ID) {
   throw runtimeError('ALLEGRO_DEVICE_ID is not provided.');
}

if (!process.env.ALLEGRO_SELLER_ID) {
   throw runtimeError('ALLEGRO_SELLER_ID is not provided.');
}

if (!process.env.ALLEGRO_USER_AGENT) {
   throw runtimeError('ALLEGRO_USER_AGENT is not provided.');
}

if (!process.env.ALLEGRO_STORE_PATH) {
   throw runtimeError('ALLEGRO_STORE_PATH is not provided.');
}

const fileStorage: StateStorage = {
   getItem: (name: string): string | null => {
      if (!existsSync(name)) return null;
      return readFileSync(name, 'utf-8');
   },
   setItem: (name: string, value: string): void => {
      writeFileSync(name, value, 'utf-8');
   },
   removeItem: (name: string): void => {
      if (existsSync(name)) unlinkSync(name);
   },
};

export const store = createPersistentStore({
   name: process.env.ALLEGRO_STORE_PATH,
   storage: fileStorage,
   config: {
      clientId: process.env.ALLEGRO_CLIENT_ID,
      clientSecret: process.env.ALLEGRO_CLIENT_SECRET,
      deviceCode: process.env.ALLEGRO_DEVICE_ID,
      sellerId: process.env.ALLEGRO_SELLER_ID,
      userAgent: process.env.ALLEGRO_USER_AGENT,
   },
});
