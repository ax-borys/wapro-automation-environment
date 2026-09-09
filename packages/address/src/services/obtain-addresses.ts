import { addressesTable, db } from '@wae/db';
import { addressInputSchema, addressSchema } from '@wae/types';
import { and, eq, or, SQL, Table } from 'drizzle-orm';
import * as v from 'valibot';
import { compareAddresses } from '../utils/compare-addresses';
import { addAddresses } from './add-addresses';
import { createObtainEntities } from '@wae/kernel';
import { createSelectSchema } from 'drizzle-orm/valibot';

const addAddressesInputSchema = v.omit(addressInputSchema, ['id']);
const addAddressReturnSchema = addressSchema;

type AddressInput = v.InferOutput<typeof addAddressesInputSchema>;
type AddressReturn = v.InferOutput<typeof addAddressReturnSchema>;

export async function obtainAddresses(
   inputAddresses: AddressInput[],
): Promise<AddressReturn[]> {
   const obtainEntities = createObtainEntities({
      table: addressesTable,
      schema: addAddressesInputSchema,
      returnSchema: addAddressReturnSchema,
      equal: (table, address) => [
         eq(table.city, address.city),
         eq(table.street, address.street),
         eq(table.postalCode, address.postalCode),
         eq(table.countryCode, address.countryCode),
      ],

      compare: (address1, address2) => compareAddresses(address1, address2),
      transform: (address, addressInput) => ({
         ...address,
         clientTag: addressInput.clientTag || null,
      }),
   });

   const addresses = await obtainEntities(inputAddresses);

   return addresses;
}
