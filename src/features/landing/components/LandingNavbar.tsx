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
import { useTranslations } from "next-intl"
//import { solutions } from "../solutions"


export function LandingNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('landing');
  const params = useParams();

  const notShowInView = ['/login', '/signup', '/mfa', `/team/join-team/${params.invitation}`]

  if(notShowInView.includes(pathname)) return null; //check how to implement it in ssr, and more gral

  return (
    <NavigationMenu className="p-2 max-w-full flex items-center justify-between w-full fixed top-0 left-0 z-10 bg-white shadow-md">
      <NavigationMenuList className="flex gap-1">
      <Image src='/gestionate-logo.svg' height={30} width={30} alt="gestionate-logo" onClick={() => router.push('/')} className="cursor-pointer" />

        <NavigationMenuItem>
          <NavigationMenuTrigger>{t('navbar-start')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/docs"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Gestionate
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      {t('navbar-gestionate')}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs#introduction" title={t('navbar-intro')}>
                {t('navbar-intro-description')}
              </ListItem>
              <ListItem href="/docs#how-it-works" title={t('navbar-how-it-works')}>
                {t('navbar-how-it-works-description')}
              </ListItem>
              <ListItem href="/docs#customize" title={t('navbar-now-what')}>
                {t('navbar-now-what-description')}
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t('navbar-products')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {products.map((product) => (
                <ListItem
                  key={product.title}
                  title={t(product.title)}
                  href={product.href}
                >
                  {t(product.description)}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* <NavigationMenuItem>
          <NavigationMenuTrigger>Soluciones</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {solutions.map((solution) => (
                <ListItem
                  key={solution.title}
                  title={solution.title}
                  href={solution.href}
                >
                  {solution.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem> */}

        <NavigationMenuItem>
          <Link href="/pricing" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t('navbar-pricing')}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>

      <div className="gap-2 flex">
        <Link href={'/login'}>
          <Button variant='outline'>{t('button-signin')}</Button>
        </Link>
        <Link href={'/signup'}>
          <Button>{t('button-signup')}</Button>
        </Link>
      </div>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
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
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
