import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { OrdersListFilters, useOrdersListStore } from '../model/store';

export function RequiredDocumentTypeFilterSelect({ ...props }) {
   const items = [
      { label: 'Receipts', value: 'RECEIPT' },
      { label: 'Invoices', value: 'INVOICE' },
      { label: 'All', value: 'ALL' },
   ] as const;

   const setRequiredDocumentTypeFilter = useOrdersListStore(
      (s) => s.setRequiredDocumentTypeFilter,
   );

   const requiredDocumentType = useOrdersListStore(
      (s) => s.filters.requiredDocumentType,
   );

   return (
      <Select
         onValueChange={(v: OrdersListFilters['requiredDocumentType']) =>
            setRequiredDocumentTypeFilter(v)
         }
         value={requiredDocumentType}
         {...props}
      >
         <SelectTrigger className="w-30">
            <SelectValue placeholder="Document" />
         </SelectTrigger>
         <SelectContent>
            <SelectGroup>
               {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                     {item.label}
                  </SelectItem>
               ))}
            </SelectGroup>
         </SelectContent>
      </Select>
   );
}
