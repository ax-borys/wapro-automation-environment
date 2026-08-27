import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../../.env');

dotenv.config({
   path: envPath,
   quiet: true,
});

export async function fetchOffers(accessToken: string) {
   const response = await fetch('https://api.allegro.pl/sale/offers', {
      headers: {
         Authorization: `Bearer ${accessToken}`,
         Accept: 'application/vnd.allegro.public.v1+json',
         'Content-Type': 'application/vnd.allegro.public.v1+json',
         'User-Agent': `${process.env.ALLEGRO_USER_AGENT!}`,
      },
   });

   if (!response.ok) {
      const errors = await response.json();
      throw errors;
   }

   return await response.json();
}
