import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiResponseRawOffersSchema } from '../offer';
import * as v from 'valibot';
import { fetchWithValidation } from '../../core';
import { store } from '../../store/store';
import { assertStore } from '../../assertions';

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
   assertStore(store);

   const { userAgent } = store.getState();
   const params = new URLSearchParams(queryParams);

   const result = await fetchWithValidation(
      apiResponseRawOffersSchema,
      v.any(),
      `https://api.allegro.pl/sale/offers?${params.toString()}`,
      {
         headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.allegro.public.v1+json',
            'Content-Type': 'application/vnd.allegro.public.v1+json',
            'User-Agent': userAgent,
         },
      },
      'Failed to obtain offers.',
   );

   return result;
}
