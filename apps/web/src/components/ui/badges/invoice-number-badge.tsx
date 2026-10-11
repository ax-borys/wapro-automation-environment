import { cn } from '@/lib/utils';
import { Badge } from '../badge';
import { CopyIcon, InvoiceIcon } from '@phosphor-icons/react';

export function InvoiceNumberBadge({
   value,
   className,
   ...props
}: React.ComponentProps<typeof Badge> & { value: string }) {
   return (
      <Badge
         className={cn(
            `
            ml-auto text-sm p-4 bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300
            `,
            className,
         )}
      >
         <InvoiceIcon className="size-4!" />
         {value}
         <CopyIcon className="size-4!" />
      </Badge>
   );
}
