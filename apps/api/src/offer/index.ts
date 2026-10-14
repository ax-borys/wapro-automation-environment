import { Hono } from 'hono';
import {
   createOffer,
   createOfferInputSchema,
   CreateOfferOutput,
   getAllOffers,
   getAllOffersWithItems,
   GetAllOffersWithItemsOutput,
   Offer,
   updateAndUnlinkItems,
   UpdateAndUnlinkItemsOutput,
   updateAndUnlinkItemsSchema,
} from '@wae/offer';
import { ApiResponse } from '@wae/types';
import { valibotJsonMiddleware } from '../helpers/valibot-middleware';

import * as allegro from '@wae/allegro';
import { db, offersTable } from '@wae/db';
import { eq } from 'drizzle-orm';

export const offer = new Hono()
   .post('/', valibotJsonMiddleware(createOfferInputSchema), async (c) => {
      const offer = c.req.valid('json');

      const result = await createOffer(offer);

      return c.json<ApiResponse<CreateOfferOutput>>({
         data: result,
         error: null,
      });
   })
   .get('/', async (c) => {
      const offers = await getAllOffers();

      return c.json<ApiResponse<Offer[]>>({
         data: offers,
         error: null,
      });
   })
   .get('/include/items', async (c) => {
      const offers = await getAllOffersWithItems();

      return c.json<ApiResponse<GetAllOffersWithItemsOutput>>({
         data: offers,
         error: null,
      });
   })
   .post(
      '/update-and-unlink-items-v2',
      valibotJsonMiddleware(updateAndUnlinkItemsSchema),
      async (c) => {
         const itemsInput = c.req.valid('json');

         const updatedItems = await updateAndUnlinkItems(itemsInput);

         return c.json<ApiResponse<UpdateAndUnlinkItemsOutput>>(
            {
               data: updatedItems,
               error: null,
            },
            200,
         );
      },
   )
   .get('/sync-offers', async (c) => {
      const data = await syncOffers();

      return c.json<ApiResponse<typeof data>>({ data, error: null });
   })
   .get('/normalize-images', async (c) => {
      const data = await convertImgSrcToS128b();

      return c.json<ApiResponse<typeof data>>({ data, error: null });
   });

async function syncOffers() {
   const offers = await allegro.getAllOffers();

   const createdOffers: CreateOfferOutput[] = [];

   const existingOffers = await getAllOffers();

   for (const offer of offers) {
      if (existingOffers.map((i) => i.externalId).includes(offer.externalId))
         return;
      const ret = await createOffer(offer);
      createdOffers.push(ret);
   }

   return createdOffers;
}

export async function convertImgSrcToS128b() {
   const offers = await getAllOffers();

   const newOffers: Offer[] = [];
   for (const offer of offers) {
      const [newOffer] = await db
         .update(offersTable)
         .set({
            imgSrc: allegro.originalImgSrcTos128b(offer.imgSrc) ?? offer.imgSrc,
         })
         .where(eq(offersTable.id, offer.id))
         .returning();

      newOffers.push(newOffer);
   }

   return newOffers;
}
