'use client'

import {
    Sidebar,
    SidebarContent,
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
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { useAppContext } from "@/context/AppContext";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Rocket } from "lucide-react";
import UpgradeCarouselDialog from "@/components/UpgradeCarouselDialog";

const notShowInView = [
  '/oauth/loading',
  '/meets/loading',
  '/onboarding',
  '/new-org'
]

const AppSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const pathname = usePathname();
    const { theme } = useTheme();
    const t = useTranslations('general')
    const { teamContext } = useAppContext();
    const { hasPermission } = useCurrentUserPermissions();
    const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);
    const { plan } = usePlanAccess();
    const hasTeam = !!teamContext?.membership;

    const isOwner = teamContext?.membership?.role === 'OWNER';
    const showUpgradeRocket = isOwner && plan !== 'ENTERPRISE';

    const isItemVisible = (item: { plans?: string[]; key: string }) => {
        if (item.plans && !item.plans.includes(plan)) return false;
        if (item.key === 'roles' && !canManageUsers) return false;
        return true;
    };

    const handleMouseEnter = () => setIsCollapsed(true);
    const handleMouseLeave = () => setIsCollapsed(false);

    const currentView = `/${pathname.split('/')[1]}`

    if (notShowInView.includes(pathname)) return null;

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
                className="pt-14 z-30"
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

                    {hasTeam && (
                    <>
                    <SidebarSeparator />

                    <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3">
                        {sidebarItems.filter(isItemVisible).map((item) => (
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
                            {sidebarBottomItems.filter(isItemVisible).map((item) => {
                                return (
                                <SidebarMenuItem key={t(item.title)} >
                                <SidebarMenuButton asChild>
                                    <Link href={item.url}>
                                    <item.icon size={30} color={currentView === item.url ?'#60a5fa' : (theme === 'dark' ? 'white' : '#212121')} />
                                    <span className={`mt-[2px] ${currentView === item.url ? 'text-[#60a5fa]' : ''}`}>{t(item.title)}</span>
                                    </Link>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            )})}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    </>
                    )}
                </SidebarContent>
                {showUpgradeRocket && (
                    <>
                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-3">
                                    <SidebarMenuItem key="upgrade">
                                        <SidebarMenuButton
                                            onClick={() => { setUpgradeDialogOpen(true); setIsCollapsed(false); }}
                                            tooltip="Upgrade"
                                        >
                                            <Rocket size={30} color="#f59e0b" />
                                            <span className=" text-amber-500 font-medium">
                                                {t('upgrade')}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <UpgradeCarouselDialog
                            open={upgradeDialogOpen}
                            onOpenChange={setUpgradeDialogOpen}
                            plan={plan}
                        />
                    </>
                )}
            </Sidebar>
        </SidebarProvider>
    );
}

export default AppSidebar;