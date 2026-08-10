import { db } from '@wae/db';
import { createReceipt } from '@wae/wapro-mag-create-receipt';

await db.transaction(async (tx) => {
   const params: Parameters<typeof createReceipt>[1] = {
      companyId: 1,
      cashRegisterId: 1,
      counterPartyId: 1,
      userId: 3000001,
      deposit: 0,
      paymentDeadline: new Date(),
      paymentFormat: 'przelew',
      pricingType: 'Brutto',
      stockId: 1,
      positions: [
         {
            productId: 412,
            quantity: 2,
            priceNetto: 244,
            priceBrutto: 300.12,
            vatCode: '23',
            discount: 0,
         },
         {
            productId: 412,
            quantity: 1,
            priceNetto: 300,
            priceBrutto: 369,
            vatCode: '23',
            discount: 0,
         },
      ],
   };

   const result = await createReceipt(tx, params);
   console.log(result);
});
