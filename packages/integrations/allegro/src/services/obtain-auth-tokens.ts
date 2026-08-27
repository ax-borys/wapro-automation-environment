import { fetchAuthTokens } from '../api/fetch-auth-tokens';
import { store } from '../store/store';

export async function obtainAuthTokens(): Promise<{
   refreshToken: string;
   accessToken: string;
}> {
   const { setRefreshToken, setAccessToken } = store.getState();
   const result = await fetchAuthTokens();

   setRefreshToken(result.refresh_token);
   setAccessToken(result.access_token);

   return {
      refreshToken: result.refresh_token,
      accessToken: result.access_token,
   };
}
