import {
   authError,
   invalidDeviceCode,
   validationError,
} from '../errors/api-errors';
import { externalApiError } from '@wae/core';
import { store } from '../store/store';
import * as v from 'valibot';

const allegroApiErrorSchema = v.object({
   error: v.string(),
   error_description: v.optional(v.string()),
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

   const response = await fetch(request);

   if (!response.ok) {
      if (response.status !== 400) {
         console.error(response);
         throw authError(`Failed to refresh tokens.`);
      }

      const errorResult = await response.json();
      const validatedErrorResult = v.safeParse(
         allegroApiErrorSchema,
         errorResult,
      );

      if (!validatedErrorResult.success) {
         throw validationError('Cannot obtain error body. Schema mistmatch.');
      }

      const { error, error_description } = validatedErrorResult.output;

      throw authError(error + ':' + error_description);
   }

   const result = await response.json();

   const validatedResult = v.safeParse(
      allegroApiRefreshTokenResponseSchema,
      result,
   );

   if (!validatedResult.success) {
      console.error(result);
      throw validationError(
         'Tokens have been fetched successfully, but response schema is different. Probably Allegro has changed it recently.',
      );
   }

   return validatedResult.output;
}
