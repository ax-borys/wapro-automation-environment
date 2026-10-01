import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type Token = string;

type Config = {
   clientId: string;
   clientSecret: string;
   deviceCode: string;
   userAgent: string;
   sellerId: string;
};

type AppState = {
   refreshToken: Token | null;
   accessToken: Token | null;
   deviceId: Config['deviceCode'];
   clientId: Config['clientId'];
   clientSecret: Config['clientSecret'];
   allegroSellerId: Config['sellerId'];
   userAgent: Config['userAgent'];
   setAccessToken: (token: Token) => void;
   setRefreshToken: (token: Token) => void;
   setDeviceId: (id: string) => void;
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
            refreshToken: null,
            accessToken: null,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            deviceId: config.deviceCode,
            userAgent: config.userAgent,
            allegroSellerId: config.sellerId,
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
            name,
            storage: createJSONStorage(() => storage),
         },
      ),
   );

export type AppStore = ReturnType<typeof createPersistentStore>;
export type { StateStorage };

export let store: AppStore | null;

export const providePersistentStore = (appStore: AppStore) => {
   if (!store) {
      store = appStore;
   }
};
