import { array, InferOutput, number, object, picklist, string } from 'valibot';

export const generateReceiptInputSchema = object({
   id: number(),
   paymentMethod: picklist(
      ['PREPAID', 'POSTPAID'],
      'Payment method must be either PREPAID or POSTPAID',
   ),
   items: array(
      object({
         offerId: string('Offer id must be a string'),
         price: number('Product price must be a number'),
         quantity: number('Product quantity must be a number'),
      }),
   ),
   total: number('Total price must be a number'),
});

export type GenerateReceiptInput = InferOutput<
   typeof generateReceiptInputSchema
>;

export const generateReceiptsInputSchema = array(generateReceiptInputSchema);
