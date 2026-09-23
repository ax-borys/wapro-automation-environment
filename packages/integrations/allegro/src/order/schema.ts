import * as v from 'valibot';

export const addressSchema = v.object({
   street: v.nullable(v.string()),
   city: v.nullable(v.string()),
   postCode: v.nullable(v.string()),
   countryCode: v.nullable(v.string()),
});

export const rawOrderSchema = v.object({
   id: v.string(),

   buyer: v.object({
      id: v.string(),
      email: v.string(),
      login: v.string(),
      firstName: v.nullable(v.string()),
      lastName: v.nullable(v.string()),
      companyName: v.nullable(v.string()),
      guest: v.boolean(),
      personalIdentity: v.nullable(v.string()),
      phoneNumber: v.nullable(v.string()),
      address: v.nullable(addressSchema),
   }),

   payment: v.object({
      type: v.picklist(['ONLINE', 'CASH_ON_DELIVERY']),
      paidAmount: v.nullable(
         v.object({
            amount: v.nullable(v.string()),
            currency: v.literal('PLN'),
         }),
      ),
   }),

   lineItems: v.array(
      v.object({
         id: v.string(),

         offer: v.object({
            id: v.string(),
            name: v.string(),
         }),

         quantity: v.number(),

         price: v.object({
            amount: v.string(),
            currency: v.string(),
         }),
      }),
   ),

   status: v.picklist([
      'READY_FOR_PROCESSING',
      'BOUGHT',
      'FILLED_IN',
      'CANCELLED',
   ]),

   fulfillment: v.object({
      status: v.picklist(['NEW', 'PROCESSING', 'SENT', 'READY_FOR_SHIPMENT']),
   }),

   delivery: v.object({
      address: v.nullable(
         v.object({
            firstName: v.string(),
            lastName: v.string(),
            street: v.string(),
            city: v.string(),
            zipCode: v.string(),
            countryCode: v.string(),
            companyName: v.nullable(v.string()),
            phoneNumber: v.nullable(v.string()),
         }),
      ),

      method: v.nullable(
         v.object({
            id: v.nullable(v.string()),
            name: v.nullable(v.string()),
         }),
      ),

      cost: v.object({
         amount: v.string(),
         currency: v.literal('PLN'),
      }),

      pickupPoint: v.nullable(
         v.object({
            id: v.nullable(v.string()),
            name: v.nullable(v.string()),
            description: v.nullable(v.string()),

            address: v.nullable(
               v.object({
                  street: v.string(),
                  zipCode: v.string(),
                  city: v.string(),
                  countryCode: v.string(),
               }),
            ),
         }),
      ),

      calculatedNumberOfPackages: v.number(),
   }),

   invoice: v.nullable(
      v.object({
         required: v.boolean(),
      }),
   ),

   summary: v.object({
      totalToPay: v.object({
         amount: v.string(),
         currency: v.literal('PLN'),
      }),
   }),

   updatedAt: v.string(),
});
