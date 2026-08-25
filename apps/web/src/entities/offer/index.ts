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
   approved?: boolean;
   items: ProductModel[];
};
