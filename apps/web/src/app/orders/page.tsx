import { SidebarTrigger } from '@/components/ui/sidebar';
import { Receipt } from '@/components/features/receipt';

export default function AllegroOrdersPage() {
   return (
      <main className="mx-auto min-w-[70vw] bg-background border-border border-x p-4">
         <SidebarTrigger />
         <Receipt />
      </main>
   );
}
