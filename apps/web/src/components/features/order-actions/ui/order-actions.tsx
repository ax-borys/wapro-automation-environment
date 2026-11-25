import { Button } from '@/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuTrigger,
   DropdownMenuLabel,
   DropdownMenuItem,
   DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
   OrderModel,
   useCancelOrders,
   useChangeRequiredDocumentType,
   useOrdersStore,
} from '@/entities/order';
import { InvoiceIcon, ReceiptIcon, TrashIcon } from '@phosphor-icons/react';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr';
import { isCancellable } from '@wae/kernel';
import { EllipsisVerticalIcon } from 'lucide-react';

export function OrderActions({ orderId }: { orderId: OrderModel['id'] }) {
   const { requiredDocumentType, original } = useOrdersStore(
      (s) => s.orders[orderId],
   );
   const cancelOrders = useCancelOrders();
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
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
               <DropdownMenuItem
                  variant="destructive"
                  onSelect={() =>
                     isCancellable({ status: original.status }) &&
                     cancelOrders([orderId])
                  }
               >
                  <ProhibitIcon />
                  Cancel
               </DropdownMenuItem>
            </DropdownMenuGroup>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
