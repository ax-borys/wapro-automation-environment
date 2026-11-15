import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { assertStore } from '../assertions';
import { SerializedSyncCursor } from '../core';

type Token = string;

type Config = {
   clientId: string;
   clientSecret: string;
   deviceCode: string;
   userAgent: string;
   sellerId: string;
   initialCursorUpdatedAtIsoDate: string;
};

export type SyncCursors = {
   readyForProcessingOrders: SerializedSyncCursor;
};

type AppState = {
   refreshToken: Token | null;
   accessToken: Token | null;
   deviceId: Config['deviceCode'];
   clientId: Config['clientId'];
   clientSecret: Config['clientSecret'];
   sellerId: Config['sellerId'];
   userAgent: Config['userAgent'];
   cursors: SyncCursors;
   setAccessToken: (token: Token) => void;
   setRefreshToken: (token: Token) => void;
   setDeviceId: (id: string) => void;
   setCursor: (name: keyof SyncCursors, cursor: SerializedSyncCursor) => void;
};

export const createPersistentStore = ({
   name,
   storage,
   config,
}: {
   name: string;
   storage: StateStorage;
   config: Config;
}) =>
   createStore<AppState>()(
      persist(
         immer((set) => ({
            cursors: {
               readyForProcessingOrders: {
                  lastSyncUpdatedAt: config.initialCursorUpdatedAtIsoDate,
               },
            },
            refreshToken: null,
            accessToken: null,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            deviceId: config.deviceCode,
            userAgent: config.userAgent,
            sellerId: config.sellerId,
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
            setCursor: (name, cursor) =>
               set((draft) => {
                  if (draft.cursors) {
                     draft.cursors[name] = cursor;
                  } else {
                     draft.cursors = { [name]: cursor };
                  }
               }),
         })),
         {
            name,
            storage: createJSONStorage(() => storage),
            partialize: ({ accessToken, refreshToken, deviceId }) => ({
               accessToken,
               refreshToken,
               deviceId,
            }),
            version: 1,
         },
      ),
   );

export type AppStore = ReturnType<typeof createPersistentStore>;
export type { StateStorage };

let instance: AppStore | null = null;

export const providePersistentStore = (appStore: AppStore) => {
   if (!instance) {
      instance = appStore;
   } else {
      throw new Error('providePersistentStore must be called once.');
   }
};

export const store: AppStore = new Proxy({} as AppStore, {
   get: (_, property) => {
      assertStore(instance);

      return Reflect.get(instance, property);
   },
});
