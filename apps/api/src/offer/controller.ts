import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addItems, createOffer, type CreateOfferInput } from '@wae/offer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

import type { Handler } from 'hono';
import type { ApiResponse } from '@wae/types';
import type {
   AddItemInput,
   AddItemsReturn,
   CreateOfferOutput,
   Offer,
} from '@wae/offer';
import { getAllOffers } from '@wae/offer';

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

export const addItemsHandler: Handler = async (c) => {
   const items = await c.req.json<AddItemInput[]>();

   const result = await addItems(items);

   return c.json<ApiResponse<AddItemsReturn>>({
      data: result,
      error: null,
   });
};
