import { ReceiptProvider } from '@/entities/receipt/receipt.context';

export default function Layout({ children }: LayoutProps<'/receipts/pending'>) {
   return <ReceiptProvider>{children}</ReceiptProvider>;
}
