import { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import { formatFullname, OrderModel } from '@/entities/order';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<DataTableFeatures, OrderModel>();

export const columns = columnHelper.columns([
   columnHelper.accessor(
      (r) => {
         const str = [
            formatFullname(
               r.original.recipient.firstName,
               r.original.recipient.lastName,
               r.original.recipient.companyName,
            ),
            r.original.delivery.pointName,
            r.original.delivery.address.city,
            r.original.delivery.address.street,
            r.original.delivery.address.postalCode,
            r.original.delivery.pointDescription,
            r.original.externalId,
         ].join(' ');

         return str;
      },
      {
         id: 'order',
      },
   ),
]);
