'use client';

import { GenerateReceiptInput } from '@wae/receipt';
import { Receipt } from '../../receipt/ui/receipt';
import { B612, Fragment_Mono } from 'next/font/google';
import { Fragment } from 'react/jsx-runtime';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ReceiptIcon } from '@phosphor-icons/react';

const data: (Omit<GenerateReceiptInput, 'items'> & {
   orderId: string;
   imgSrc: string;
   items: (GenerateReceiptInput['items'][number] & { name: string })[];
   buyerFullname: string;
   orderProcessedAt: string;
})[] = [
   {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '1',
            price: 25000,
            quantity: 1,
            name: 'Geforce RTX 5090',
         },
      ],
      total: 25000,
      imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
      orderProcessedAt: new Date().toDateString(),
      orderId: '1',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'POSTPAID',
      items: [
         {
            offerId: '2',
            price: 6000,
            quantity: 1,
            name: 'Geforce RTX 5080',
         },
      ],
      total: 6000,
      imgSrc: 'http://localhost:8082/public/rtx5080.png',
      orderProcessedAt: new Date().toDateString(),
      orderId: '2',
      buyerFullname: 'Alex Borysiuk',
   },
   {
      paymentMethod: 'PREPAID',
      items: [
         {
            offerId: '1',
            price: 20000,
            quantity: 1,
            name: 'Geforce RTX 5090',
         },
         {
            offerId: '2',
            price: 6000,
            quantity: 2,
            name: 'Geforce RTX 5080',
         },
      ],
      total: 32000,
      imgSrc: 'http://localhost:8082/public/rtx5080.png',
      orderProcessedAt: new Date().toDateString(),
      orderId: '3',
      buyerFullname: 'Alex Borysiuk',
   },
];

export function ReceiptFeed() {
   const [selected, setSelected] = useState<Set<string>>(new Set());

   const addToSelected = (orderId: string) => {
      setSelected((s) => new Set([...s, orderId]));
   };

   const removeFromSelected = (orderId: string) => {
      const selectedCopy = new Set(selected);
      selectedCopy.delete(orderId);

      setSelected(selectedCopy);
   };

   const selectHandler = (orderId: string) => {
      const isSelected = selected.has(orderId);

      if (!isSelected) {
         addToSelected(orderId);
      } else {
         removeFromSelected(orderId);
      }
   };

   const selectAll = () => {
      setSelected(new Set(data.map((o) => o.orderId)));
   };

   const removeAll = () => {
      setSelected(new Set());
   };

   const selectAllHandler = () => {
      const isSelectedAll = selected.size === data.length;

      if (isSelectedAll) {
         removeAll();
      } else {
         selectAll();
      }
   };

   return (
      <div className="h-screen">
         <div className="w-full h-12 px-6 flex items-center gap-3 text-muted-foreground text-sm">
            <div
               className="flex items-center gap-3 cursor-pointer"
               onClick={selectAllHandler}
            >
               <Checkbox
                  checked={selected.size === data.length}
                  className="cursor-pointer"
               />
               <span className="">Select all</span>
            </div>
            {selected.size ? (
               <>
                  <Separator
                     orientation="vertical"
                     className="h-4 translate-y-4"
                  />
                  {selected.size}
                  <Separator
                     orientation="vertical"
                     className="h-4 translate-y-4"
                  />
                  <Button
                     size={'sm'}
                     variant={'ghost'}
                     className="cursor-pointer"
                  >
                     <ReceiptIcon /> Record selected
                  </Button>
               </>
            ) : null}
         </div>
         <Separator />
         <div className="overflow-scroll max-h-full pb-28">
            {data.map((order, i) => (
               <Fragment key={order.orderId}>
                  <Receipt
                     order={order}
                     selected={selected.has(order.orderId)}
                     onSelect={() => selectHandler(order.orderId)}
                  />
                  {i + 1 === data.length ? null : <Separator />}
               </Fragment>
            ))}
         </div>
      </div>
   );
}
