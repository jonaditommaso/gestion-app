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
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { products } from "../products"
import { solutions } from "../solutions"

export function LandingNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  if(pathname === '/login' || pathname === '/signup') return null; //check how to implement it in ssr, and more gral


  return (
    <NavigationMenu className="p-2 max-w-full flex items-center justify-between w-full fixed top-0 left-0 z-10 bg-white shadow-md">
      <NavigationMenuList className="flex gap-1">
      <Image src='/own-logo.svg' height={25} width={25} alt="own-logo" onClick={() => router.push('/')} className="cursor-pointer" />

        <NavigationMenuItem>
          <NavigationMenuTrigger>Comienza</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Gestionate
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      La aplicacion web que te permite gestionar tu empresa
                      de manera mas eficiente. Todo lo que necesitas, en un
                      solo sitio.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduccion">
                De que trata Gestionate y como puede ayudarte en tu trabajo.
              </ListItem>
              <ListItem href="/docs/installation" title="Como funciona">
                Todo lo que debes saber para comenzar a usar Gestionate.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Y ahora que?">
                Gestionate es personalizable, mira todo lo que puedes hacer
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Productos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {products.map((product) => (
                <ListItem
                  key={product.title}
                  title={product.title}
                  href={product.href}
                >
                  {product.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
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
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/pricing" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Precios
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>

      <div className="gap-2 flex">
        <Button variant='outline' onClick={() => router.push('/login')}>Iniciar sesión</Button>
        <Button>Regístrate</Button>
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
