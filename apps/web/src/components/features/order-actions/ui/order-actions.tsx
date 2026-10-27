import { Button } from '@/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuTrigger,
   DropdownMenuLabel,
   DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
   OrderModel,
   useChangeRequiredDocumentType,
   useOrdersStore,
} from '@/entities/order';
import { InvoiceIcon, ReceiptIcon } from '@phosphor-icons/react';
import { EllipsisVerticalIcon } from 'lucide-react';

export function OrderActions({ orderId }: { orderId: OrderModel['id'] }) {
   const { requiredDocumentType } = useOrdersStore((s) => s.orders[orderId]);
   const changeRequiredDocumentType = useChangeRequiredDocumentType(orderId);

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant={'ghost'}
               className="focus-visible:outline-none focus-visible:ring-0 border-0"
            >
               <EllipsisVerticalIcon />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent onChange={() => {}} className="min-w-40">
            <DropdownMenuGroup>
               <DropdownMenuLabel className="flex items-center gap-1">
                  Actions
               </DropdownMenuLabel>
               {requiredDocumentType === 'INVOICE' ? (
                  <DropdownMenuItem
                     onSelect={() => changeRequiredDocumentType('RECEIPT')}
                  >
                     <ReceiptIcon />
                     Require receipt
                  </DropdownMenuItem>
               ) : (
                  <DropdownMenuItem
                     onSelect={() => changeRequiredDocumentType('INVOICE')}
                  >
                     <InvoiceIcon />
                     Require invoice
                  </DropdownMenuItem>
               )}
            </DropdownMenuGroup>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
