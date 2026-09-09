import { addressesTable, db } from '@wae/db';
import { addressInputSchema, addressSchema } from '@wae/types';
import * as v from 'valibot';

const addAddressesInputSchema = v.omit(addressInputSchema, ['id']);
const addAddressReturnSchema = addressSchema;

type AddressInput = v.InferOutput<typeof addAddressesInputSchema>;
type AddressReturn = v.InferOutput<typeof addAddressReturnSchema>;

export async function addAddresses(
   inputAddresses: AddressInput[],
): Promise<AddressReturn[]> {
   if (!inputAddresses.length) return [];

   const addresses = await db
      .insert(addressesTable)
      .values(inputAddresses)
      .returning();

   return addresses;
}
