import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiResponseRawOffer, RawOffer } from './offer';

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
      const errors = await response.json();
      throw errors;
   }

   return (await response.json()) as ApiResponseRawOffer;
}
