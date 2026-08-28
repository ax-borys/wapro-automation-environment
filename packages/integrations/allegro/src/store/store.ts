import dotenv, { configDotenv } from 'dotenv';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
   clientIdIsNotSet,
   clientSecretIsNotSet,
   deviceIdIsNotSet,
   sellerIdIsNotSet,
   userAgentIsNotSet,
} from '../errors/api-errors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../../.env');
const storagePath = path.resolve(__dirname, './storage.json');

type Config = {
   ALLEGRO_CLIENT_ID: string;
   ALLEGRO_DEVICE_ID: string;
   ALLEGRO_CLIENT_SECRET: string;
   ALLEGRO_USER_AGENT: string;
   ALLEGRO_SELLER_ID: string;
};

const output = dotenv.config({
   path: envPath,
});

const config = output.parsed as Config;

if (!config.ALLEGRO_DEVICE_ID) {
   throw deviceIdIsNotSet();
}

if (!config.ALLEGRO_CLIENT_ID) {
   throw clientIdIsNotSet();
}

if (!config.ALLEGRO_CLIENT_SECRET) {
   throw clientSecretIsNotSet();
}

if (!config.ALLEGRO_USER_AGENT) {
   throw userAgentIsNotSet();
}

if (!config.ALLEGRO_SELLER_ID) {
   throw sellerIdIsNotSet();
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

type Token = string;

type AppState = {
   refreshToken: Token | null;
   accessToken: Token | null;
   deviceId: Config['ALLEGRO_DEVICE_ID'];
   clientId: Config['ALLEGRO_CLIENT_ID'];
   clientSecret: Config['ALLEGRO_CLIENT_SECRET'];
   allegroSellerId: Config['ALLEGRO_SELLER_ID'];
   userAgent: Config['ALLEGRO_USER_AGENT'];
   setAccessToken: (token: Token) => void;
   setRefreshToken: (token: Token) => void;
   setDeviceId: (id: string) => void;
};

export const store = createStore<AppState>()(
   persist(
      immer((set) => ({
         refreshToken: null,
         accessToken: null,
         clientId: config.ALLEGRO_CLIENT_ID,
         clientSecret: config.ALLEGRO_CLIENT_SECRET,
         deviceId: config.ALLEGRO_DEVICE_ID,
         userAgent: config.ALLEGRO_USER_AGENT,
         allegroSellerId: config.ALLEGRO_SELLER_ID,
         setAccessToken: (token) =>
            set((draft) => {
               draft.accessToken = token;
            }),
         setRefreshToken: (token) =>
            set((draft) => {
               draft.refreshToken = token;
            }),
         setDeviceId: (id) =>
            set((draft) => {
               draft.deviceId = id;
            }),
      })),
      {
         name: storagePath,
         storage: createJSONStorage(() => fileStorage),
      },
   ),
);
