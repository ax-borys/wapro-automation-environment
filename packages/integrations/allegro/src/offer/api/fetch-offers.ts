import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiResponseRawOffersSchema } from '../offer';
import { allegroError, validationError } from '../../errors/api-errors';
import * as v from 'valibot';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../../.env');

dotenv.config({
   path: envPath,
   quiet: true,
});

export type QueryParams = {
   'publication.status'?: 'INACTIVE' | 'ACTIVE' | 'ACTIVATING' | 'ENDED';
   limit?: string;
   offset?: string;
};

type ApiResponseRawOffer = v.InferOutput<typeof apiResponseRawOffersSchema>;

export async function fetchOffers(
   accessToken: string,
   queryParams?: QueryParams,
): Promise<ApiResponseRawOffer> {
   const params = new URLSearchParams(queryParams);
   const response = await fetch(
      `https://api.allegro.pl/sale/offers?${params.toString()}`,
      {
         headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.allegro.public.v1+json',
            'Content-Type': 'application/vnd.allegro.public.v1+json',
            'User-Agent': `${process.env.ALLEGRO_USER_AGENT!}`,
         },
      },
   );

   if (!response.ok) {
      throw allegroError(
         `Failed to obtain offers. Got status ${response.status}.`,
         'EXTERNAL_API_ERROR',
      );
   }

   const result = await response.json();

   const validatedResult = v.safeParse(apiResponseRawOffersSchema, result);

   if (!validatedResult.success) {
      throw validationError(
         'Offers have been fetched successfully, but response schema is different. Probably, Allegro has been changed it recently.',
         validatedResult.issues,
      );
   }

   return validatedResult.output;
}
