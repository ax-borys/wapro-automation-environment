import { cn } from '@/lib/utils';
import { Badge } from '../badge';
import { CopyIcon, InvoiceIcon } from '@phosphor-icons/react';
import { Button } from '../button';

export function InvoiceNumberBadge({
   value,
   className,
   ...props
}: React.ComponentProps<typeof Badge> & { value: string }) {
   return (
      <Button
         onClick={() => navigator.clipboard.writeText(value)}
         className="bg-transparent hover:bg-transparent cursor-pointer px-0"
      >
         <Badge
            className={cn(
               `
            ml-auto w-34 justify-start p-4 underline font-medium bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300
            `,
               className,
            )}
         >
            <CopyIcon className="size-4!" />
            <div className="mx-auto"> {value}</div>
         </Badge>
      </Button>
   );
}
