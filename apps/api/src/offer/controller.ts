import {
   addItems,
   addProducts,
   createOffer,
   getAllOffersWithItems,
   type CreateOfferInput,
} from '@wae/offer';

import type { Handler } from 'hono';
import type { ApiResponse } from '@wae/types';
import {
   AddItemInput,
   AddItemOutput,
   AddProductInput,
   AddProductOutput,
   CreateOfferOutput,
   GetAllOffersWithItemsOutput,
   getAllProducts,
   Offer,
} from '@wae/offer';
import { getAllOffers } from '@wae/offer';
import { createFactory } from 'hono/factory';
import { Product } from '@wae/offer/src/schemas';

const factory = createFactory();
const createHandler = factory.createHandlers.bind(factory);

export const createOfferHandler = createHandler(async (c) => {
   const offer = await c.req.json<CreateOfferInput>();

   const result = await createOffer(offer);

   return c.json<ApiResponse<CreateOfferOutput>>({
      data: result,
      error: null,
   });
});

export const getOffersHandler = createHandler(async (c) => {
   const offers = await getAllOffers();

   return c.json<ApiResponse<Offer[]>>({
      data: offers,
      error: null,
   });
});

export const getAllOffersWithItemsHandler = createHandler(async (c) => {
   const offers = await getAllOffersWithItems();

   return c.json<ApiResponse<GetAllOffersWithItemsOutput>>({
      data: offers,
      error: null,
   });
});

export const addItemsHandler = createHandler(async (c) => {
   const items = await c.req.json<AddItemInput[]>();

   const result = await addItems(items);

   return c.json<ApiResponse<AddItemOutput[]>>({
      data: result,
      error: null,
   });
});

export const addProductsHandler = createHandler(async (c) => {
   const products = await c.req.json<AddProductInput[]>();

   const result = await addProducts(products);

   return c.json<ApiResponse<AddProductOutput[]>>({
      data: result,
      error: null,
   });
});

export const getAllProductsHandler = createHandler(async (c) => {
   const products = await getAllProducts();

   return c.json<ApiResponse<Product[]>>({
      data: products,
      error: null,
   });
});
