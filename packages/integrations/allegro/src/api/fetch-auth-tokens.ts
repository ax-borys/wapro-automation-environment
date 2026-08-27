import { invalidDeviceCode } from '../errors/api-errors';
import { externalApiError } from '@wae/core';
import { store } from '../store/store';

type AllegroApiErrorResponse = {
   error: string;
};

export type AllegroApiRefreshTokenResponse = {
   access_token: string;
   token_type: string;
   refresh_token: string;
   expires_in: number;
   scope: 'allegro_api';
   jti: string;
};

export async function fetchAuthTokens(): Promise<AllegroApiRefreshTokenResponse> {
   const { refreshToken, clientId, clientSecret, deviceId } = store.getState();

   const response = await fetch(`http://allegro.pl/auth/oauth/token`, {
      method: 'POST',
      headers: {
         Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
         'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
         refreshToken
            ? {
                 grant_type: 'grant_type=refresh_token',
                 refresh_token: refreshToken,
              }
            : {
                 grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                 device_code: deviceId,
              },
      ),
   });

   if (!response.ok) {
      if (response.status !== 400) {
         throw new Error(`Failed to refresh tokens.`);
      }

      const { error } = (await response.json()) as AllegroApiErrorResponse;

      switch (error) {
         case 'Invalid device code':
            throw invalidDeviceCode();
         default:
            throw externalApiError('ALLEGRO_CODE: ' + error);
      }
   }

   const result = (await response.json()) as AllegroApiRefreshTokenResponse;

   return result;
}
