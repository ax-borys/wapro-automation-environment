import { ReceiptsDataTable } from '@/components/widgets/receipts-data-table';

export default async function ReceiptHistoryPage() {
   return (
      <div className="flex flex-col min-h-0 h-full">
         <ReceiptsDataTable
            initialData={[
               {
                  id: 1,
                  order: {
                     externalId: 'ord_ext_1001',
                     customer: {
                        externalId: 'cust_ext_2001',
                        firstName: 'Jane',
                        lastName: 'Doe',
                        companyName: null,
                     },
                     packages: 1,
                     paymentMethod: 'PREPAID',
                     totalPaid: 9998,
                     totalToPay: 9998,
                  },
                  number: 'RCP/2024/0001',
                  fiscalNumber: 'FSC-000123456',
                  createdAt: new Date('2024-01-15T10:30:00Z'),
               },
            ]}
         />
      </div>
   );
}
