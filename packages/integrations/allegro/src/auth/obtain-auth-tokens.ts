import { fetchAuthTokens } from './fetch-auth-tokens';
import { store } from '../store/store';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as v from 'valibot';

interface AllegroJwtPayload extends JwtPayload {
   iss: string;
   user_name: string;
   scope: string[];
   allegro_api: boolean;
   exp: number;
   client_id: string;
   jti: string;
}

const allegroJwtPayloadSchema = v.object({
   iss: v.string(),
   user_name: v.string(),
   scope: v.array(v.string()),
   allegro_api: v.boolean(),
   exp: v.pipe(v.number(), v.integer()),
   client_id: v.string(),
   jti: v.string(),
}) satisfies v.GenericSchema<AllegroJwtPayload>;

const checkTokenFreshness = (token: string): boolean => {
   const payload: JwtPayload | null = jwt.decode(token, { json: true });

   if (!payload) return false;

   try {
      const validPayload = v.parse(allegroJwtPayloadSchema, payload);
      const isFresh = validPayload.exp * 1000 >= Date.now();

      return isFresh;
   } catch (error) {
      return false;
   }
};

export async function obtainAuthTokens(): Promise<{
   refreshToken: string;
   accessToken: string;
}> {
   const { refreshToken, accessToken, setRefreshToken, setAccessToken } =
      store.getState();

   if (accessToken) {
      console.log('Access token freshness: ', checkTokenFreshness(accessToken));
   }

   if (refreshToken && accessToken && checkTokenFreshness(accessToken)) {
      return { accessToken, refreshToken };
   }

   const result = await fetchAuthTokens();

   setRefreshToken(result.refresh_token);
   setAccessToken(result.access_token);

   return {
      refreshToken: result.refresh_token,
      accessToken: result.access_token,
   };
}
