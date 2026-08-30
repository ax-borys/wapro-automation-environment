import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ProductModel = {
   id: number;
   name: string;
   externalId: string;
   // Implement it here `cuz i don't want to create Item type for that
   quantity: number;
};

export type OfferModel = {
   id: number;
   externalId: string;
   imgSrc: string;
   title: string;
   src: string;
   active?: boolean;
   approved: boolean;
   items: Record<ProductModel['id'], ProductModel>;
};

type OffersStore = {
   offers: Record<OfferModel['id'], OfferModel>;
   add: (offer: OfferModel) => void;
   remove: (id: OfferModel['id']) => void;
   replace: (offer: Partial<OfferModel>) => void;
   addItem: (id: OfferModel['id'], item: ProductModel) => void;
   removeItem: (id: OfferModel['id'], itemId: ProductModel['id']) => void;
   setItems: (
      id: OfferModel['id'],
      items: Record<ProductModel['id'], ProductModel>,
   ) => void;
};

export const useOffersStore = create<OffersStore>()(
   immer((set, get) => ({
      offers: {},
      add: (offer) =>
         set((s) => {
            if (!s.offers[offer.id]) s.offers[offer.id] = offer;
         }),
      remove: (id) =>
         set((s) => {
            delete s.offers[id];
         }),
      replace: (offer) =>
         set((s) => {
            if (!offer.id) return;

            const mutant = { ...s.offers[offer.id], ...offer };
            s.offers[offer.id] = mutant;
         }),
      addItem: (id, item) =>
         set((s) => {
            if (!s.offers[id].items[item.id])
               s.offers[id].items[item.id] = item;
         }),
      setItems: (id, items) =>
         set((s) => {
            s.offers[id].items = items;
         }),
      removeItem: (id, itemId) =>
         set((s) => {
            delete s.offers[id].items[itemId];
         }),
   })),
);
