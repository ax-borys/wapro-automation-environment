import { CardDemo } from '@/components/ui/demo-card';
import OrderCard from '@/components/ui/order-card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
   BadgePaid,
   ReceiptCard,
   ReceiptCardBody,
   ReceiptCardFooter,
   ReceiptCardHeader,
   ReceiptCardTable,
   ReceiptCardTableBody,
   ReceiptCardTableFooter,
   ReceiptCardTableHeader,
   ReceiptCardTablePosition,
} from '@/components/ui/receipt-card';
import { Checkbox } from '@/components/ui/checkbox';

export default function AllegroOrdersPage() {
   return (
      <main className="mx-auto min-w-[70vw] bg-background border-border border-x p-4">
         <SidebarTrigger />
         <ReceiptCard>
            <ReceiptCardHeader>
               <Checkbox />
               <span className="font-medium underline">Order #1232123324</span>
               <BadgePaid />
            </ReceiptCardHeader>
            <ReceiptCardBody>
               <ReceiptCardTable>
                  <ReceiptCardTableHeader />
                  <ReceiptCardTableBody>
                     <ReceiptCardTablePosition
                        imgSrc={
                           'https://a.allegroimg.com/original/117845/036dd0bf45839a8a9710cdacea58'
                        }
                        name="XIREN 1 kg Środek na ślimaki granulat skuteczny name ślimaki ogrodowe"
                        quantity={1}
                        tax="23"
                        net={24.39}
                        gross={30}
                     />
                  </ReceiptCardTableBody>
                  <ReceiptCardTableFooter totalNet={24.39} totalGross={30} />
               </ReceiptCardTable>
            </ReceiptCardBody>
            <ReceiptCardFooter />
         </ReceiptCard>
      </main>
   );
}
