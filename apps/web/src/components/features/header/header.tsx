'use client';
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react/jsx-runtime';

export function Header() {
   const pathname = usePathname();
   const paths = pathname.split('/').slice(1);

   return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
         <SidebarTrigger className="-ml-1" />
         <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 translate-y-6"
         />
         <Breadcrumb>
            <BreadcrumbList>
               {paths.map((p, i) => (
                  <Fragment key={p + i}>
                     <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink
                           href={`/${paths.slice(0, i + 1).join('/')}`}
                        >
                           {p.charAt(0).toUpperCase() + p.slice(1)}
                        </BreadcrumbLink>
                     </BreadcrumbItem>
                     {i === paths.length - 1 ? null : (
                        <BreadcrumbSeparator className="hidden md:block" />
                     )}
                  </Fragment>
               ))}
            </BreadcrumbList>
         </Breadcrumb>
      </header>
   );
}
