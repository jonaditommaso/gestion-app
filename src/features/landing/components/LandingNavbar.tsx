"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { useParams, usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { products } from "../products"
import { useLocale, useTranslations } from "next-intl"
import { AlignJustify, BookOpen, Bolt, ChevronDown, Telescope, X, LayoutDashboard } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguagesSelection } from "@/components/LanguagesSelection"
import { useIsMobile } from "@/hooks/use-mobile"
import { useScrolling } from "@/hooks/useScrolling"
import { Separator } from "@/components/ui/separator"

export function LandingNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('landing');
  const currentLocale = useLocale();
  const params = useParams();
  const [open, setOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isMobile = useIsMobile();
  const isScrolled = useScrolling()

  React.useEffect(() => {
    if(isMobileMenuOpen && isMobile === false) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile, isMobileMenuOpen]);

  const notShowInView = ['/login', '/oauth/loading', '/meets/loading', '/signup', '/mfa', '/onboarding', `/team/join-team/${params.invitation}`, `/shared/task/${params.token}`]

  if(notShowInView.includes(pathname)) return null; //check how to implement it in ssr, and more gral

  if (isMobile === undefined) return null;

  const handleNavigation = (route: string) => {
    setIsMobileMenuOpen(false);
    router.push(route);
  }

  const isWhiteBg = pathname === '/pricing' || pathname === '/docs';

  return (
    <NavigationMenu className={`p-2 max-w-full flex items-center justify-between fixed top-2 inset-x-4 z-50 transition-all duration-300 rounded-lg backdrop-blur-lg bg-white/10 border-b border-white/10 shadow-lg`}>
      {isMobile && <Image src={isScrolled ? '/gestionate-logo.svg': '/gestionate-logo-white.svg'} height={30} width={30} alt="gestionate-logo" onClick={() => router.push('/')} className="cursor-pointer" />}

      {!isMobile && (
        <NavigationMenuList className="flex gap-1">
        <Image src={isWhiteBg ? '/gestionate-logo.svg': '/gestionate-logo-white.svg'} height={30} width={30} alt="gestionate-logo" onClick={() => router.push('/')} className="cursor-pointer mx-2" />

        <NavigationMenuItem>
          <NavigationMenuTrigger
          className={cn('text-white bg-transparent', isWhiteBg && 'text-black', 'data-[state=open]:bg-white data-[state=open]:text-black')}
          >
            {t('navbar-start')}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3 border-r">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/getting-started"
                  >
                    <Image src='/gestionate-logo.svg' height={70} width={70} alt="gestionate-navbar-logo" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Gestionate
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      {t('navbar-gestionate')}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/getting-started#first-steps" title={t('navbar-intro')} icon={<BookOpen className="h-5 w-5" />}>
                {t('navbar-intro-description')}
              </ListItem>
              <ListItem href="/getting-started#features" title={t('navbar-how-it-works')} icon={<Bolt className="h-5 w-5" />}>
                {t('navbar-how-it-works-description')}
              </ListItem>
              <ListItem href="/docs" title={t('navbar-now-what')} icon={<Telescope className="h-5 w-5" />}>
                {t('navbar-now-what-description')}
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger
          className={cn('text-white bg-transparent', isWhiteBg && 'text-black', 'data-[state=open]:bg-white data-[state=open]:text-black')}

          >
            {t('navbar-products')}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
              <div className="w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] list-none">
                <ListItem
                    key='explore-all-products'
                    title={t('navbar-products-all')}
                    href='/products'
                    icon={<LayoutDashboard className="h-5 w-5" />}
                  >
                    {t('navbar-products-all-description')}
                  </ListItem>
                  <Separator />
              </div>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {products.map((product) => (
                <ListItem
                  key={product.title}
                  title={t(product.title)}
                  href={product.href}
                  icon={product.icon}
                >
                  {t(product.description)}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/pricing" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'bg-transparent text-white', isWhiteBg && 'text-black')}>
              {t('navbar-pricing')}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    )}

      <div className="flex items-center gap-2">
        <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("mr-3 flex h-9 items-center gap-1 rounded-xl border border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-0 max-sm:mr-0", isWhiteBg && "text-black")}
            >
              <span className="text-sm font-semibold uppercase tracking-wide">{currentLocale}</span>
              <ChevronDown className="h-4 w-4 opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-fit">
            <LanguagesSelection className="flex-col" label={true} />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 border-l border-white/15 pl-3">
          <Link href={'/login'}>
            <Button variant='outline' className="rounded-xl">{t('button-signin')}</Button>
          </Link>
          {!isMobile && <Link href={'/pricing'}>
            <Button variant={isScrolled || isWhiteBg ? 'default' : 'link'} className={cn("text-white rounded-xl")}>{t('get-started')}</Button>
          </Link>}
          {isMobile && (
             <AlignJustify onClick={() => setIsMobileMenuOpen(true)} />
          )}
        </div>
      </div>
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-20 flex flex-col items-center justify-center gap-4 text-2xl">
          <X className="absolute m-auto top-40" size={40} onClick={() => setIsMobileMenuOpen(false)} />
          <div onClick={() => handleNavigation("/docs")}>
            Gestionate
          </div>
          <div onClick={() => handleNavigation("/products")}>
            {t('navbar-products')}
          </div>
          <div onClick={() => handleNavigation("/pricing")}>
            {t('navbar-pricing')}
          </div>
        </div>
      )}
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode; title: React.ReactNode }
>(({ className, title, icon, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none flex items-center gap-3">
            {icon && <span>{icon}</span>}
            <span>{title}</span></div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
