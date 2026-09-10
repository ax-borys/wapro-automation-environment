import { addressSchema } from '@wae/types';
import * as v from 'valibot';

const compareAddressInputSchema = v.omit(addressSchema, ['id', 'clientTag']);

type CompareAddressInput = v.InferInput<typeof compareAddressInputSchema>;

export function compareAddresses(
   address1: CompareAddressInput,
   address2: CompareAddressInput,
): boolean {
   let similar = true;
   const validatedAddress1 = v.parse(compareAddressInputSchema, address1);
   const validatedAddress2 = v.parse(compareAddressInputSchema, address2);

   for (const key in address1) {
      if (
         validatedAddress1[key as keyof typeof validatedAddress1] !==
         validatedAddress2[key as keyof typeof validatedAddress2]
      ) {
         similar = false;
      }
   }

   return similar;
}
