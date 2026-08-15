import { Button } from '@/components/ui/button';
import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

export function AppSidebar() {
   return (
      <Sidebar collapsible="icon">
         <SidebarHeader className="">
            <div className="flex items-center h-8 w-full overflow-x-hidden">
               <Button className="size-8 grow-0">
                  <AtomIcon />
               </Button>
               <h1 className="ml-2 shrink-0">Bussiness Platform</h1>
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
                                 <span>Orders</span>
                                 <ChevronRight className="ml-auto" />
                              </SidebarMenuButton>
                           </CollapsibleTrigger>
                           <CollapsibleContent>
                              <SidebarMenuSub>
                                 <SidebarMenuSubItem>
                                    <SidebarMenuSubButton>
                                       Allegro
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
