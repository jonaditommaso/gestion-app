'use client'
// import SearchCommand from "@/components/SearchCommand";
// import { Badge } from "@/components/ui/badge";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // DropdownMenuLabel, DropdownMenuSeparator,
import UserButton from "@/features/auth/components/UserButton";
// import { BellIcon, ChevronsUpDown } from "lucide-react"; // ChevronDown,
// import Image from "next/image";
import { usePathname } from "next/navigation";
import { ToggleThemeMode } from "./ToggleThemeMode";
import { useTheme } from "next-themes";
import { useCurrent } from "@/features/auth/api/use-current";

const AppNavbar = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { data: user } = useCurrent();

  if(pathname === '/login' || pathname === '/signup') return null; //check how to implement it in ssr, and more gral

  return ( //ml-10
    <nav className={`border-b shadow-md fixed top-0 z-20 grid grid-cols-2 items-center w-full ${theme === 'dark' ? 'bg-[#212121]' : 'bg-white' }`}>
      {/* <DropdownMenu>
        <DropdownMenuTrigger className="max-w-40 flex items-center gap-2 p-2 focus:outline-none">
          <Image src='/logo.svg' height={50} width={100} alt="logo" />
          <ChevronsUpDown size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>+ Agregar empresa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      <p className="max-w-40 flex items-center gap-2 p-2">{user?.prefs?.company}</p>

      {/* //! TODO: APPLY THIS SEARCH LATER and put grid-cols-3 in nav to restore style */}
      {/* <SearchCommand /> */}
      <div className="flex items-center justify-end p-1 mr-5 gap-4">
        <ToggleThemeMode />
        {/* <div className="relative cursor-pointer">
          <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-800 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
            17
          </Badge>
          <button
            aria-label="show 17 new notifications"
            className="p-2 text-gray-600 hover:text-red-600 bg-transparent rounded-full"
          >
            <BellIcon size={22} />
          </button>
        </div> */}
        <UserButton />
      </div>
    </nav>
  );
};

export default AppNavbar;
