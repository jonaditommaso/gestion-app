'use client'
import SearchCommand from "@/components/SearchCommand";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UserButton from "@/features/auth/components/UserButton";
import { Check, ChevronsUpDown, Plus, Rocket } from "lucide-react";
import { usePathname } from "next/navigation";
import { ToggleThemeMode } from "./ToggleThemeMode";
import NoTeamWarningIcon from "@/features/team/components/NoTeamWarningIcon";
import ToggleChatBot from "./ToggleChatBot";
import HomeCustomizationTrigger from "./HomeCustomizationTrigger";
import NotificationsTrigger from "./NotificationsTrigger";
import { useSwitchOrg } from "@/features/team/api/use-switch-org";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";

const notShowInView = [
  '/login',
  '/signup',
  '/oauth/loading',
  '/meets/loading',
  '/onboarding',
  '/new-org',
]

const AppNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('general');
  const { teamContext, isLoadingTeamContext: isLoadingContext } = useAppContext();
  const { mutate: switchOrg, isPending: isSwitching } = useSwitchOrg();

  const orgName = teamContext?.org?.name;
  const allContexts = teamContext?.allContexts ?? [];
  const currentMembershipId = teamContext?.membership?.$id;
  const currentRole = teamContext?.membership?.role;
  const hasTeam = !!teamContext?.membership;

  if (notShowInView.includes(pathname)) return null;

  const handleSwitch = (membershipId: string) => {
    switchOrg({ json: { membershipId } }, {
      onSuccess: () => router.refresh()
    });
  };

  const TriggerContent = isLoadingContext ? (
    <span className="w-20 h-4 rounded bg-muted animate-pulse" />
  ) : (
    <span className="flex items-center gap-1 truncate">
      {orgName ?? (!hasTeam && <NoTeamWarningIcon />)}
      <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-60" />
    </span>
  );

  return (
    <nav className='border-b shadow-md fixed top-0 z-40 grid grid-cols-3 items-center w-full bg-sidebar'>
      <div className="max-w-44 flex items-center p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isSwitching || isLoadingContext}
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity truncate max-w-full focus:outline-none"
          >
            {TriggerContent}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            {allContexts.map((c) => (
              <DropdownMenuItem
                key={c.membership.$id}
                onClick={() => c.membership.$id !== currentMembershipId && handleSwitch(c.membership.$id)}
                className="flex items-center gap-2"
              >
                <Check className={`w-4 h-4 shrink-0 ${c.membership.$id === currentMembershipId ? 'opacity-100 cursor-default' : 'opacity-0 cursor-pointer'}`} />
                {c.org.name}
              </DropdownMenuItem>
            ))}
            {allContexts.length > 0 && <DropdownMenuSeparator />}
            {currentRole === 'OWNER' && (
              <DropdownMenuItem
                className="flex items-center gap-2 !cursor-pointer text-[#f59e0b] hover:!text-[#f59e0b]/80"
                onClick={() => router.push('/pricing')}
              >
                <Rocket className="w-4 h-4 shrink-0" />
                {t('improve-plan')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="flex items-center gap-2 !cursor-pointer"
              onClick={() => router.push('/new-org')}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {t('add-organization')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasTeam ? (
        <>
          <SearchCommand />
          <div className="flex items-center justify-end p-1 mr-5 gap-4">
            <HomeCustomizationTrigger />
            <ToggleChatBot />
            <ToggleThemeMode />
            <NotificationsTrigger />
            <UserButton />
          </div>
        </>
      ) : (
        <>
          <span />
          <div className="flex items-center justify-end p-1 mr-5 gap-4">
            <UserButton />
          </div>
        </>
      )}
    </nav>
  );
};

export default AppNavbar;
