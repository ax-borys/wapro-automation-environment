import { ReceiptProvider } from '@/entities/receipt/receipt.context';

export default function Layout({ children }: LayoutProps<'/receipts/allegro'>) {
   return (
      <div>
         <ReceiptProvider>{children}</ReceiptProvider>
      </div>
   );
}
