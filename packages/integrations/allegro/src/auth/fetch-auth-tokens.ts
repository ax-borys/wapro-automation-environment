import { BaseError, statusToCode } from '@wae/error';
import { contractMismatch, errorOccured } from '../error';
import { store } from '../store/store';
import * as v from 'valibot';
import { fetchWithValidation } from '../core';

const allegroApiErrorSchema = v.object({
   error: v.string(),
   error_description: v.nullish(v.string()),
});

const allegroApiRefreshTokenResponseSchema = v.object({
   access_token: v.string(),
   token_type: v.string(),
   refresh_token: v.string(),
   expires_in: v.number(),
   jti: v.string(),
});

export type AllegroApiRefreshTokenResponse = v.InferOutput<
   typeof allegroApiRefreshTokenResponseSchema
>;

export async function fetchAuthTokens(): Promise<AllegroApiRefreshTokenResponse> {
   const { refreshToken, clientId, clientSecret, deviceId } = store.getState();
   const request = new Request(`https://allegro.pl/auth/oauth/token`, {
      method: 'POST',
      headers: {
         Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
         'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
         refreshToken
            ? {
                 grant_type: 'refresh_token',
                 refresh_token: refreshToken,
              }
            : {
                 grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                 device_code: deviceId,
              },
      ),
   });

   const result = await fetchWithValidation(
      allegroApiRefreshTokenResponseSchema,
      allegroApiErrorSchema,
      request,
      'Failed to obtain auth tokens.',
   );

   return result;
}
