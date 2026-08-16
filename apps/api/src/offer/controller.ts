import type { Offer } from '@wae/db/src/db/schema.js';
import type { Handler } from 'hono';
import { addOffer } from './queries.js';
import type { ApiResponse } from '@wae/types';
import type { AddOfferInput } from './schema.js';

export const addOfferHandler: Handler = async (c) => {
   const offerData = await c.req.json<AddOfferInput>();

   const result = await addOffer(offerData);

   return c.json<ApiResponse<typeof result>>({
      data: result,
      error: null,
   });
};
