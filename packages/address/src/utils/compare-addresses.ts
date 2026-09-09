import { addressSchema } from '@wae/types';
import * as v from 'valibot';

const compareAddressInputSchema = v.omit(addressSchema, ['id', 'clientTag']);

type CompareAddressInput = v.InferInput<typeof compareAddressInputSchema>;

export function compareAddresses(
   address1: CompareAddressInput,
   address2: CompareAddressInput,
): boolean {
   let similar = true;

   for (const key in address1) {
      if (
         address1[key as keyof typeof address1] !==
         address2[key as keyof typeof address1]
      ) {
         similar = false;
      }
   }

   return similar;
}
