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
   );
