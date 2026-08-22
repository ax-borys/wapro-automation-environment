'use client';

import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import { CalendarIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { addDays, format } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { Field, FieldLabel } from './field';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Calendar } from './calendar';
import {
   DropdownMenu,
   DropdownMenuCheckboxItem,
   DropdownMenuTrigger,
   DropdownMenuContent,
} from './dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';

export function Toolbar({
   children,
   className,
   ...props
}: React.ComponentProps<'div'>) {
   return (
      <div
         className={cn(
            'flex justify-between h-12 items-center border-b border-border px-6',
            className,
         )}
         {...props}
      >
         {children}
      </div>
   );
}

export function ToolbarGroup({
   children,
   className,
   ...props
}: React.ComponentProps<'div'>) {
   return (
      <div className={cn('flex', className)} {...props}>
         {children}
      </div>
   );
}

export function ToolbarSearchbar({
   children,
   className,
   value,
   onChange,
   ...props
}: React.ComponentProps<typeof InputGroup> &
   React.ComponentProps<typeof InputGroupInput>) {
   return (
      <InputGroup className={cn('', className)} {...props}>
         <InputGroupInput
            placeholder="Filter"
            value={value}
            onChange={onChange}
         />
         <InputGroupAddon>
            <MagnifyingGlassIcon />
         </InputGroupAddon>
      </InputGroup>
   );
}

export function ToolbarDatePickerWithRange({
   date,
   onDateSelect,
}: {
   date: DateRange | undefined;
   onDateSelect?: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) {
   return (
      <Field className="mx-auto w-60">
         <Popover>
            <PopoverTrigger asChild>
               <Button
                  variant="outline"
                  id="date-picker-range"
                  className="justify-start px-2.5 font-normal"
               >
                  <CalendarIcon />
                  {date?.from ? (
                     date.to ? (
                        <>
                           {format(date.from, 'LLL dd, y')} -{' '}
                           {format(date.to, 'LLL dd, y')}
                        </>
                     ) : (
                        format(date.from, 'LLL dd, y')
                     )
                  ) : (
                     <span>Pick a date</span>
                  )}
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
               <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={onDateSelect}
                  numberOfMonths={2}
               />
            </PopoverContent>
         </Popover>
      </Field>
   );
}

export function ToolbarSelectMenu({
   name,
   children,
}: {
   name: string;
   children: ReactNode;
}) {
   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant={'outline'}>
               {name}
               <ChevronDownIcon />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-50">
            {children}
         </DropdownMenuContent>
      </DropdownMenu>
   );
}

export function ToolbarSelectMenuCheckboxItem({
   ...props
}: React.ComponentProps<typeof DropdownMenuCheckboxItem>) {
   return <DropdownMenuCheckboxItem {...props} />;
}
