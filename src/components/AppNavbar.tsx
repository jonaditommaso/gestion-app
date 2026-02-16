'use client'
import SearchCommand from "@/components/SearchCommand";
// import { Badge } from "@/components/ui/badge";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // DropdownMenuLabel, DropdownMenuSeparator,
import UserButton from "@/features/auth/components/UserButton";
// import { BellIcon, ChevronsUpDown } from "lucide-react"; // ChevronDown,
// import Image from "next/image";
import { usePathname } from "next/navigation";
import { ToggleThemeMode } from "./ToggleThemeMode";
import { useCurrent } from "@/features/auth/api/use-current";
import NoTeamWarningIcon from "@/features/team/components/NoTeamWarningIcon";
import ToggleChatBot from "./ToggleChatBot";
import HomeCustomizationTrigger from "./HomeCustomizationTrigger";
import NotificationsTrigger from "./NotificationsTrigger";

const AppNavbar = () => {
  const pathname = usePathname();
  const { data: user } = useCurrent();

  if(pathname === '/login' || pathname === '/signup' || pathname === '/oauth/loading' || pathname === '/meets/loading') return null; //check how to implement it in ssr, and more gral

  return ( //ml-10
    <nav className='border-b shadow-md fixed top-0 z-20 grid grid-cols-3 items-center w-full bg-sidebar'>
      {/* <DropdownMenu>
        <DropdownMenuTrigger className="max-w-40 flex items-center gap-2 p-2 focus:outline-none">
          <Image src='/logo.svg' height={50} width={100} alt="logo" />
          <ChevronsUpDown size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>+ Agregar empresa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      <p className="max-w-40 flex items-center gap-2 p-2">{user && (user?.prefs?.company ?? <NoTeamWarningIcon />)}</p>

      <SearchCommand />
      <div className="flex items-center justify-end p-1 mr-5 gap-4">

        <HomeCustomizationTrigger />

        <ToggleChatBot />

        <ToggleThemeMode />

        <NotificationsTrigger />

        <UserButton />
      </div>
    </nav>
  );
};

export default AppNavbar;
