type Address = {
   street: string | null;
   city: string | null;
   postCode: string | null;
   countryCode: string | null;
};

export type RawOrder = {
   id: string;
   buyer: {
      id: string;
      email: string;
      login: string;
      firstName: string | null;
      lastName: string | null;
      companyName: string | null;
      guest: boolean;
      personalIdentity: string | null;
      phoneNumber: string | null;
      address: Address | null;
   };
   payment: {
      type: 'ONLINE' | 'CASH_ON_DELIVERY';
      paidAmount: {
         amount: string | null;
         currency: 'PLN';
      } | null;
   };
   lineItems: {
      id: string;
      offer: {
         id: string;
         name: string;
      };
      quantity: number;
      price: {
         amount: string;
         currency: string;
      };
   }[];
   status: 'READY_FOR_PROCESSING' | 'BOUGHT' | 'FILLED_IN' | 'CANCELLED';
   fulfillment: {
      status: 'NEW' | 'PROCESSING' | 'SENT' | 'READY_FOR_SHIPMENT';
   };
   delivery: {
      address: {
         firstName: string;
         lastName: string;
         street: string;
         city: string;
         zipCode: string;
         countryCode: string;
         companyName: string | null;
         phoneNumber: string | null;
      } | null;
      cost: {
         amount: string;
         currency: 'PLN';
      };
      pickupPoint: {
         id: string | null;
         name: string | null;
         description: string | null;
         address: {
            street: string;
            zipCode: string;
            city: string;
            countryCode: string;
         } | null;
      } | null;
      calculatedNumberOfPackages: number;
   };
   invoice: {
      required: boolean;
   };
   summary: {
      totalToPay: {
         amount: string;
         currency: 'PLN';
      };
   };
   updatedAt: string;
};

export type ApiResponseRawOrder = {
   checkoutForms: RawOrder[];
   count: number;
   totalCount: number;
};
