import {
   fetchOffers,
   fetchRefreshToken,
   getAccessToken,
   getRefreshToken,
   saveAccessToken,
   saveRefreshToken,
} from '@wae/allegro';

export async function getAllOffers() {
   const tokens = {
      refreshToken: await getRefreshToken(),
      accessToken: await getAccessToken(),
   };

   try {
      if (!tokens.accessToken || !tokens.refreshToken) {
         const tokensData = await fetchRefreshToken(null);
         tokens.refreshToken = tokensData.refresh_token;
         tokens.accessToken = tokensData.access_token;
      }
   } catch (error) {
      console.error('Failed to obtain tokens.');
      throw error;
   }

   saveRefreshToken(tokens.refreshToken);
   saveAccessToken(tokens.accessToken);

   const offers = await fetchOffers(tokens.accessToken);

   return offers;
}
