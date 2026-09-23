import * as v from 'valibot';

export const rawOfferSchema = v.object({
   id: v.string(),
   name: v.string(),
   primaryImage: v.object({
      url: v.string(),
   }),
});

export const apiResponseRawOffersSchema = v.object({
   offers: v.array(rawOfferSchema),
   count: v.number(),
   totalCount: v.number(),
});
