'use client';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Checkbox } from './checkbox';
import {
   Table,
   TableBody,
   TableHead,
   TableHeader,
   TableRow,
   TableCell,
   TableCaption,
   TableFooter,
} from './table';
import { Badge } from './badge';
import { Button } from './button';
import { Separator } from './separator';
import { BadgeCheck } from 'lucide-react';
import {
   ReceiptIcon,
   SealCheckIcon,
   User,
   UserIcon,
} from '@phosphor-icons/react';
import {
   Item,
   ItemContent,
   ItemMedia,
   ItemTitle,
   ItemActions,
   ItemDescription,
} from './item';

export default function OrderCard() {
   return (
      <Card className="ring-0 shadow-none">
         <CardHeader className="flex items-center gap-4">
            <Checkbox />
            <span className="font-medium underline">Order #1232123324</span>
            <Badge className="ml-auto text-sm p-4 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
               <SealCheckIcon className="size-4!" />
               Paid
            </Badge>
         </CardHeader>
         <CardContent>
            <Table className="table-fixed max-w-[75vw]">
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-auto">Name</TableHead>
                     <TableHead className="w-20 text-right">Quantity</TableHead>
                     <TableHead className="w-20 text-center">Vat</TableHead>
                     <TableHead className="w-30 text-right ">Netto</TableHead>
                     <TableHead className="w-30 text-right">Brutto</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  <TableRow>
                     <TableCell className="font-medium text-sm flex items-center gap-2">
                        <Image
                           src="https://a.allegroimg.com/original/117845/036dd0bf45839a8a9710cdacea58"
                           alt="Product preview"
                           width={20}
                           height={30}
                        />
                        <div className="overflow-scroll">
                           XIREN 1 kg Środek na ślimaki granulat skuteczny na
                           ślimaki ogrodowe
                        </div>
                     </TableCell>
                     <TableCell className="text-center">x1</TableCell>
                     <TableCell className="text-center">23%</TableCell>
                     <TableCell className="text-right">24,39 zł</TableCell>
                     <TableCell className="text-right">30,00 zł</TableCell>
                  </TableRow>
               </TableBody>
               <TableFooter>
                  <TableRow>
                     <TableCell colSpan={3}>Total</TableCell>
                     <TableCell className="text-right">24,39 zł</TableCell>
                     <TableCell className="text-right">30,00 zł</TableCell>
                  </TableRow>
               </TableFooter>
            </Table>
         </CardContent>
         <CardFooter>
            <Item>
               <ItemMedia variant={'icon'}>
                  <UserIcon />
               </ItemMedia>
               <ItemContent>
                  <ItemTitle>Alex Borysiuk</ItemTitle>
                  <ItemDescription>21 Sep, Wed, 12:30</ItemDescription>
               </ItemContent>
               <ItemActions>
                  <Button>
                     <ReceiptIcon /> Record a receipt
                  </Button>
               </ItemActions>
            </Item>
         </CardFooter>
      </Card>
   );
}
