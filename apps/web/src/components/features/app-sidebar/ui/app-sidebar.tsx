'use client';
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
import { MoonIcon, PlugsIcon, SunIcon } from '@phosphor-icons/react';
import { AtomIcon, ChevronLeft, ChevronRight, Notebook } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function AppSidebar() {
   const theme = useTheme();
   return (
      <Sidebar collapsible="icon">
         <SidebarHeader className="">
            <div className="flex items-center h-8 w-full overflow-x-hidden">
               <Button className="size-8 grow-0" asChild>
                  <Link href="/">
                     <Logo className="size-5" />
                  </Link>
               </Button>
               <div className="ml-3 h-full flex flex-col gap-3.5 justify-center space-x-3 tracking-wide">
                  <span className="font-bold text-base leading-0">
                     Automation
                  </span>
                  <span className="text-xs leading-0 text-muted-foreground self-end translate-x-2">
                     platform v0.0.1
                  </span>
               </div>
               <Button
                  variant={'outline'}
                  className="ml-7 size-8"
                  onClick={() =>
                     theme.resolvedTheme === 'light'
                        ? theme.setTheme('dark')
                        : theme.setTheme('light')
                  }
               >
                  <SunIcon weight="bold" />
               </Button>
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
                                       <Link href="/receipts/pending">
                                          Pending
                                       </Link>
                                    </SidebarMenuSubButton>
                                 </SidebarMenuSubItem>
                                 <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                       <Link href="/receipts/repository">
                                          Repository
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
            <SidebarGroup>
               <SidebarGroupLabel>Configuration</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     <Collapsible defaultOpen>
                        <SidebarMenuItem>
                           <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="flex">
                                 <PlugsIcon />
                                 <span>Integrations</span>
                                 <ChevronRight className="ml-auto" />
                              </SidebarMenuButton>
                           </CollapsibleTrigger>
                           <CollapsibleContent>
                              <SidebarMenuSub>
                                 <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                       <Link href="/integrations/allegro">
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
         </SidebarContent>
         <SidebarFooter />
      </Sidebar>
   );
}
