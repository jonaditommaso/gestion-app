'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { initialItem, sidebarBottomItems, sidebarItems } from "@/utils/sidebarItems";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const AppSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { theme } = useTheme();
    const t = useTranslations('general')

    const handleMouseEnter = () => setIsCollapsed(true);
    const handleMouseLeave = () => setIsCollapsed(false);

    const currentView = `/${pathname.split('/')[1]}`

    if (pathname === '/oauth/loading') return null

    return (
        <SidebarProvider open={isCollapsed}>
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <Sidebar
                variant="sidebar"
                collapsible="icon"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="pt-14 z-10"
            >
                <SidebarContent>

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-3 mt-1">
                            {initialItem.map((item) => (
                                <SidebarMenuItem key={t(item.title)}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url}>
                                        <item.icon size={30} color={currentView === item.url ? '#60a5fa' : (theme === 'dark' ? 'white' : '#212121')} />
                                        <span className={`mt-[2px] ${currentView === item.url ? 'text-[#60a5fa]' : ''}`}>{t(item.title)}</span>
                                    </Link>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3">
                        {sidebarItems.map((item) => (
                            <SidebarMenuItem key={t(item.title)} >
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                <item.icon size={30} color={currentView === item.url ? '#60a5fa' : (theme === 'dark' ? 'white' : '#212121')} />
                                <span className={`mt-[2px] ${currentView === item.url ? 'text-[#60a5fa]' : ''}`}>{t(item.title)}</span>
                                </Link>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-3">
                            {sidebarBottomItems.map((item) => (
                                <SidebarMenuItem key={t(item.title)} >
                                <SidebarMenuButton asChild>
                                    <Link href={item.url}>
                                    <item.icon size={30} color={currentView === item.url ?'#60a5fa' : (theme === 'dark' ? 'white' : '#212121')} />
                                    <span className={`mt-[2px] ${currentView === item.url ? 'text-[#60a5fa]' : ''}`}>{t(item.title)}</span>
                                    </Link>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter />
            </Sidebar>
        </SidebarProvider>
    );
}

export default AppSidebar;