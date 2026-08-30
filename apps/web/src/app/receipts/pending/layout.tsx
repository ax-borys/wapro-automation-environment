import { ReceiptProvider } from '@/entities/receipt/receipt.context';

export default function Layout({ children }: LayoutProps<'/receipts/allegro'>) {
   return <ReceiptProvider>{children}</ReceiptProvider>;
}
