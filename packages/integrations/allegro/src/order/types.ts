export type RawOrder = {
   id: string;
   payment: {
      type: 'ONLINE' | 'CASH_ON_DeLIVERY';
      paidAmount: {
         amount: string;
         currency: 'PLN';
      };
   };
   status: 'READY_FOR_PROCESSING' | 'BOUGHT' | 'FILLED_IN' | 'CANCELLED';
   fulfillment: {
      status: 'NEW' | 'PROCESSING' | 'SENT' | 'READY_FOR_SHIPMENT';
   };
   delivery: {
      cost: {
         amount: string;
         currency: 'PLN';
      };
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
};

export type ApiResponseRawOrder = {
   checkoutForms: RawOrder[];
   count: number;
   totalCount: number;
};
