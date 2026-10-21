import { cn } from '@/lib/utils';
import { Badge } from '../badge';
import { CopyIcon } from '@phosphor-icons/react';
import { Button } from '../button';

export function ReceiptNumberBadge({
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
               `ml-auto p-4 underline font-medium bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300`,
               className,
            )}
         >
            <CopyIcon className="size-4!" />
            <div className="mx-auto"> {value}</div>
         </Badge>
      </Button>
   );
}
