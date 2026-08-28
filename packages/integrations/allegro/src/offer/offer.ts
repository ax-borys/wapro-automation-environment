export type RawOffer = {
   id: string;
   name: string;
   primaryImage: {
      url: string;
   };
};

export type ApiResponseRawOffer = {
   offers: RawOffer[];
   count: number;
   totalCount: number;
};
