import jwt, { JwtPayload } from 'jsonwebtoken';
import { store } from '../store/store';
import { assertStore } from '../assertions';

const MOCK_SECRET = 'mock-secret';
const ACCESS_TOKEN_TTL_SECONDS = 12 * 60 * 60; // Allegro access tokens live 12h

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createMockAccessToken = (): string =>
   jwt.sign(
      {
         iss: 'https://allegro.pl',
         user_name: 'mock_user',
         scope: ['allegro:api:sale:offers:read', 'allegro:api:orders:read'],
         allegro_api: true,
         client_id: 'mock-client-id',
         jti: crypto.randomUUID(),
      },
      MOCK_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
   );

const createMockRefreshToken = (): string =>
   jwt.sign({ jti: crypto.randomUUID() }, MOCK_SECRET, {
      expiresIn: 90 * 24 * 60 * 60,
   });

const isFresh = (token: string): boolean => {
   const payload: JwtPayload | null = jwt.decode(token, { json: true });

   return !!payload?.exp && payload.exp * 1000 >= Date.now();
};

export async function obtainAuthTokens(): Promise<{
   refreshToken: string;
   accessToken: string;
}> {
   assertStore(store);

   const { refreshToken, accessToken, setRefreshToken, setAccessToken } =
      store.getState();

   if (refreshToken && accessToken && isFresh(accessToken)) {
      return { accessToken, refreshToken };
   }

   await delay(200);

   const newAccessToken = createMockAccessToken();
   const newRefreshToken = createMockRefreshToken();

   setRefreshToken(newRefreshToken);
   setAccessToken(newAccessToken);

   return {
      refreshToken: newRefreshToken,
      accessToken: newAccessToken,
   };
}
