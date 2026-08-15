export type Currency = 'PLN' | string;

export type Money = {
   amount: string;
   currency: Currency;
};

export type Buyer = {
   id: string;
   firstName: string;
   lastName: string;
   email: string;
   login: string;
   guest: boolean;
   phoneNumber: string;
   company: string | null;
   preferences: {
      language: string;
   };
   personalIdentity: string | null;
};

export type Seller = {
   id: string;
   login: string;
};

export type DeliveryAddress = {
   firstName: string;
   lastName: string;
   street: string;
   city: string;
   zipCode: string;
   countryCode: string;
   company: string | null;
   phoneNumber: string;
};

export type DeliveryMethod = {
   id: string;
   name: string;
   payment: {
      type: 'PREPAID' | 'CASH_ON_DELIVERY' | string;
   };
   carrier: {
      id: string;
      type: 'COURIER' | 'PARCEL_LOCKER' | string;
   };
   waybillExpected: boolean;
};

export type DeliveryTimeWindow = {
   from: string; // ISO 8601 datetime
   to: string; // ISO 8601 datetime
};

export type DeliveryTime = {
   from: string;
   to: string;
   dispatch: DeliveryTimeWindow;
   reprediction: unknown | null;
};

export type DeliveryDiscount = {
   planType: 'SMART' | string;
   type: 'SMART' | string;
};

export type DeliveryFlags = {
   cofinancing: boolean;
   buyerCofinancing: boolean;
};

export type Delivery = {
   address: DeliveryAddress;
   method: DeliveryMethod;
   pickupPoint: unknown | null;
   cost: Money;
   discount: DeliveryDiscount | null;
   time: DeliveryTime;
   numberOfPackages: number;
   flags: DeliveryFlags;
   addressUpdatedAt: string | null;
   includesMultipleOrders: boolean;
   cancelled: boolean;
};

export type Invoice = {
   required: boolean;
   address: unknown | null;
   uploaded: boolean;
   features: unknown | null;
};

export type PaymentAdditionalInfo = {
   refundBpp: unknown | null;
   allegroPay: boolean;
   ept: boolean;
   wireTransfer: boolean;
   isRefundable: boolean;
};

export type Payment = {
   id: string;
   status: 'PAID' | 'UNPAID' | 'REFUNDED' | string;
   lastChanged: string;
   provider: string;
   paid: Money;
   operation: 'PAYMENT' | string;
   splitPayment: boolean;
   extendedTerm: boolean;
   reconciliation: unknown | null;
   additionalInfo: PaymentAdditionalInfo;
};

export type Tracking = {
   trackingNumber: string;
   carrierId: string;
   carrierName: string | null;
};

export type Product = {
   id: string;
   quantity: number;
   name: string;
   imageUrl: string;
};

export type ProductSet = {
   products: Product[];
};

export type Offer = {
   id: string;
   externalId: string | null;
   name: string;
   imageUrl: string;
   offerUrl: string;
   productSet: ProductSet;
   hsNumber: string | null;
};

export type CommissionRefunds = {
   accepted?: 'NONE' | 'PARTIAL' | 'FULL' | string;
   active?: boolean;
};

export type ItemReturns = {
   totalReturnedQuantity: number;
};

export type LineItemDelivery = {
   handlingTime: string; // ISO 8601 duration, e.g. "PT48H"
};

export type SerialNumbers = {
   expected: boolean;
   entries: string[];
};

export type LineItem = {
   id: string;
   offer: Offer;
   quantity: number;
   originalPrice: Money;
   price: Money;
   additionalServices: unknown[];
   boughtAt: string;
   isSubsidized: boolean;
   reconciliation: unknown | null;
   commissionRefunds: CommissionRefunds;
   itemReturns: ItemReturns;
   vouchers: unknown[];
   delivery: LineItemDelivery;
   discounts: unknown | null;
   deposit: unknown | null;
   serialNumbers: SerialNumbers;
};

export type OrderSummary = {
   paymentStatus: 'PAID' | 'UNPAID' | string;
   paymentLastChanged: string;
   totalToPay: Money;
   totalPaid: Money;
   reconciliation: unknown | null;
};

export type OrderAction = {
   type: 'RECEIPT_REQUIRED' | string;
};

export type Fulfillment = {
   provider: 'SELLER' | 'ALLEGRO' | string;
};

export type Marketplace = {
   id: string;
   name: string;
};

export type AllegroOrder = {
   id: string;
   seller: Seller;
   buyer: Buyer;
   sellerNote: string | null;
   buyerNote: string | null;
   delivery: Delivery;
   invoice: Invoice;
   payments: Payment[];
   tracking: Tracking[];
   orderDate: string;
   status: 'SENT' | 'READY_FOR_PROCESSING' | 'CANCELLED' | string;
   statusUpdatedAt: string;
   buyerErased: boolean;
   charity: unknown | null;
   commissionRefunds: CommissionRefunds;
   labels: string[];
   questionFromBuyer: unknown | null;
   fulfillment: Fulfillment;
   unpaidOrderNotifications: unknown[];
   actions: OrderAction[];
   buyerOrderStatus: 'READY_FOR_PROCESSING' | string;
   lineItems: LineItem[];
   subsidyAmount: unknown | null;
   summary: OrderSummary;
   cancelledBy: unknown | null;
   features: string[];
   currency: Currency;
   itemReturnStatus: 'NONE' | 'PARTIAL' | 'FULL' | string;
   marketplace: Marketplace;
};
