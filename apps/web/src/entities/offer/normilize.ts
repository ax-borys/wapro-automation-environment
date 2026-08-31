import { OfferModel, ProductModel } from './offer.store';

export const normilizeOffers: (
   offersArr: OfferModel[],
) => Record<OfferModel['id'], OfferModel> = (
   offersArr: OfferModel[],
): Record<OfferModel['id'], OfferModel> => {
   const offers: Record<OfferModel['id'], OfferModel> = {};

   offersArr.forEach((offer) => (offers[offer.id] = offer));

   return offers;
};

export const normilizeItems: (
   itemsArr: ProductModel[],
) => Record<ProductModel['id'], ProductModel> = (itemsArr) => {
   const items: Record<ProductModel['id'], ProductModel> = {};

   itemsArr.forEach((item) => (items[item.id] = item));

   return items;
};
