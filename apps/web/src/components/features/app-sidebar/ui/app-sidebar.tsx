import { Button } from '@/components/ui/button';
import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Logo } from '@/components/ui/logo';
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuAction,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { AtomIcon, ChevronLeft, ChevronRight, Notebook } from 'lucide-react';
import Link from 'next/link';

export function AppSidebar() {
   return (
      <Sidebar collapsible="icon">
         <SidebarHeader className="">
            <div className="flex items-center h-8 w-full overflow-x-hidden">
               <Button className="size-8 grow-0">
                  <Logo className="size-5" />
               </Button>
               <div className="ml-3 h-full flex flex-col gap-3.5 justify-center space-x-3 tracking-wide">
                  <span className="font-bold text-base leading-0">
                     Automation
                  </span>
                  <span className="text-xs leading-0 text-muted-foreground self-end translate-x-2">
                     platform v0.0.1
                  </span>
               </div>
            </div>
         </SidebarHeader>
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel>Platfrom</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     <Collapsible defaultOpen>
                        <SidebarMenuItem>
                           <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="flex">
                                 <Notebook />
                                 <span>Receipts</span>
                                 <ChevronRight className="ml-auto" />
                              </SidebarMenuButton>
                           </CollapsibleTrigger>
                           <CollapsibleContent>
                              <SidebarMenuSub>
                                 <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                       <Link href="/receipts/allegro">
                                          Allegro
                                       </Link>
                                    </SidebarMenuSubButton>
                                 </SidebarMenuSubItem>
                              </SidebarMenuSub>
                           </CollapsibleContent>
                        </SidebarMenuItem>
                     </Collapsible>
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup />
         </SidebarContent>
         <SidebarFooter />
      </Sidebar>
   );
}
