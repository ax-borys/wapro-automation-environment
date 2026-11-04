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
   'offer.id'?: string[];
};

type ApiResponseRawOffer = v.InferOutput<typeof apiResponseRawOffersSchema>;

const buildQueryParams = (queryParams: QueryParams): URLSearchParams => {
   const params = new URLSearchParams();

   for (const [key, value] of Object.entries(queryParams) as [
      keyof QueryParams,
      QueryParams[keyof QueryParams],
   ][]) {
      if (value === undefined) continue;

      if (Array.isArray(value)) {
         for (const item of value) {
            params.append(key, item);
         }
      } else {
         params.append(key, value);
      }
   }

   return params;
};

export async function fetchOffers(
   accessToken: string,
   queryParams?: QueryParams,
): Promise<ApiResponseRawOffer> {
   assertStore(store);

   const { userAgent } = store.getState();
   const params = queryParams ? buildQueryParams(queryParams) : '';
   const url = `https://api.allegro.pl/sale/offers?${params.toString()}`;

   const result = await fetchWithValidation(
      apiResponseRawOffersSchema,
      v.any(),
      url,
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
