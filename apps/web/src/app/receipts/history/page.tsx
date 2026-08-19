import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReceiptHistoryPage() {
    return (
        <div className="px-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-auto">
                            Buyer name
                        </TableHead>
                        <TableHead className="text-right w-10">
                            Packages
                        </TableHead>
                        <TableHead className="text-right">Number</TableHead>
                        <TableHead className="text-right">Fiskal number</TableHead>
                        <TableHead className="text-right">Payment</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>

                </TableHeader>
                <TableBody>
                    <TableRow>
                            <TableCell>Alex Borysiuk</TableCell>
                            <TableCell className="text-center">1</TableCell>
                            <TableCell className="text-right">P/0001/08/26</TableCell>
                            <TableCell className="text-right">W038123</TableCell>
                            <TableCell className="text-right">Paid</TableCell>
                            <TableCell className="text-right">1 600,00</TableCell>
                        </TableRow> 
                </TableBody>
            </Table>
        </div>
    )
}