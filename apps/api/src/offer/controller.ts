import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOffer, type CreateOfferInput } from '@wae/offer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

import type { Handler } from 'hono';
import type { ApiResponse } from '@wae/types';
import type { CreateOfferOutput, Offer } from '@wae/offer/src/schemas.js';
import { getAllOffers } from '@wae/offer/src/services/get-all-offers.js';

export const createOfferHandler: Handler = async (c) => {
   const offer = await c.req.json<CreateOfferInput>();

   const result = await createOffer(offer);

   return c.json<ApiResponse<CreateOfferOutput>>({
      data: result,
      error: null,
   });
};

export const getOffersHandler: Handler = async (c) => {
   const offers = await getAllOffers();

   return c.json<ApiResponse<Offer[]>>({
      data: offers,
      error: null,
   });
};
