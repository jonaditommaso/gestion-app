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

const LIGHT_SURFACE_ENTER_THRESHOLD = 0.66
const LIGHT_SURFACE_EXIT_THRESHOLD = 0.46
const SUPPORTED_LOCALES = new Set(["en", "es", "it"])
const SURFACE_SAMPLE_X_POSITIONS = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82, 0.94]
const MIN_CONTAINER_WIDTH_RATIO = 0.55
const MIN_CONTAINER_HEIGHT = 80

type ParsedRgbaColor = {
  r: number
  g: number
  b: number
  a: number
}

let colorParserContext: CanvasRenderingContext2D | null = null

const getPathWithoutLocale = (pathname: string): string => {
  const segments = pathname.split("/")
  const locale = segments[1]

  if (!SUPPORTED_LOCALES.has(locale)) {
    return pathname
  }

  const nextPath = `/${segments.slice(2).join("/")}`
  return nextPath === "/" ? "/" : nextPath.replace(/\/$/, "") || "/"
}

const getColorParserContext = (): CanvasRenderingContext2D | null => {
  if (typeof window === "undefined") {
    return null
  }

  if (colorParserContext) {
    return colorParserContext
  }

  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  colorParserContext = canvas.getContext("2d", { willReadFrequently: true })
  return colorParserContext
}

const parseCssColor = (color: string): ParsedRgbaColor | null => {
  const parserContext = getColorParserContext()

  if (!parserContext) {
    return null
  }

  parserContext.clearRect(0, 0, 1, 1)
  parserContext.fillStyle = "rgba(0, 0, 0, 0)"
  parserContext.fillStyle = color
  parserContext.fillRect(0, 0, 1, 1)

  const imageData = parserContext.getImageData(0, 0, 1, 1).data
  return {
    r: imageData[0],
    g: imageData[1],
    b: imageData[2],
    a: imageData[3] / 255,
  }
}

const toLinearRgb = (channel: number): number => {
  const normalized = channel / 255
  if (normalized <= 0.03928) {
    return normalized / 12.92
  }
  return ((normalized + 0.055) / 1.055) ** 2.4
}

const getRelativeLuminance = ({ r, g, b }: ParsedRgbaColor): number => {
  const linearR = toLinearRgb(r)
  const linearG = toLinearRgb(g)
  const linearB = toLinearRgb(b)
  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB
}

const getBackgroundImageLuminance = (backgroundImage: string): number | null => {
  if (!backgroundImage || backgroundImage === "none") {
    return null
  }

  const colorTokens = backgroundImage.match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8})/g)

  if (!colorTokens || colorTokens.length === 0) {
    return null
  }

  let luminanceSum = 0
  let alphaSum = 0

  colorTokens.forEach((token) => {
    const parsedColor = parseCssColor(token)

    if (!parsedColor || parsedColor.a <= 0.01) {
      return
    }

    luminanceSum += getRelativeLuminance(parsedColor) * parsedColor.a
    alphaSum += parsedColor.a
  })

  if (alphaSum === 0) {
    return null
  }

  return luminanceSum / alphaSum
}

const getStyleLuminance = (styles: CSSStyleDeclaration): number | null => {
  const backgroundColor = parseCssColor(styles.backgroundColor)
  if (backgroundColor && backgroundColor.a > 0.04) {
    return getRelativeLuminance(backgroundColor)
  }

  return getBackgroundImageLuminance(styles.backgroundImage)
}

const getElementSurfaceLuminance = (element: Element): number | null => {
  let currentElement: HTMLElement | null = element as HTMLElement

  while (currentElement && currentElement !== document.body) {
    const styles = getComputedStyle(currentElement)
    const luminance = getStyleLuminance(styles)

    if (luminance !== null) {
      return luminance
    }

    currentElement = currentElement.parentElement
  }

  return getStyleLuminance(getComputedStyle(document.body))
}

const getLargeSurfaceContainer = (element: Element): Element => {
  let currentElement: HTMLElement | null = element as HTMLElement
  const minWidth = window.innerWidth * MIN_CONTAINER_WIDTH_RATIO

  while (currentElement && currentElement !== document.body) {
    const rect = currentElement.getBoundingClientRect()

    if (rect.width >= minWidth && rect.height >= MIN_CONTAINER_HEIGHT) {
      return currentElement
    }

    currentElement = currentElement.parentElement
  }

  return document.body
}

const isIgnoredSurfaceCandidate = (element: Element, navbar: Element): boolean => {
  if (navbar.contains(element)) {
    return true
  }

  const tagName = element.tagName
  if (tagName === "A" || tagName === "BUTTON" || tagName === "SVG" || tagName === "PATH") {
    return true
  }

  const htmlElement = element as HTMLElement
  const styles = getComputedStyle(htmlElement)

  if (styles.position === "fixed" || styles.position === "sticky") {
    return true
  }

  const elementId = htmlElement.id.toLowerCase()
  const className = typeof htmlElement.className === "string" ? htmlElement.className.toLowerCase() : ""

  if (elementId.includes("nextjs") || className.includes("nextjs") || className.includes("devtools")) {
    return true
  }

  return false
}

const getMedian = (values: number[]): number => {
  const sortedValues = [...values].sort((a, b) => a - b)
  const middleIndex = Math.floor(sortedValues.length / 2)

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2
  }

  return sortedValues[middleIndex]
}

const getSurfaceLuminanceBelowNavbar = (): number | null => {
  const navbar = document.querySelector('[data-landing-navbar="true"]')
  if (!navbar) {
    return null
  }

  const navRect = navbar.getBoundingClientRect()
  const sampleY = Math.max(2, Math.round(navRect.top + navRect.height * 0.66))
  const sampleXPositions = SURFACE_SAMPLE_X_POSITIONS.map((ratio) => Math.round(window.innerWidth * ratio))
  const luminanceSamples: number[] = []

  sampleXPositions.forEach((sampleX) => {
    const stackedElements = document.elementsFromPoint(sampleX, sampleY)
    const targetElement = stackedElements.find((element) => !isIgnoredSurfaceCandidate(element, navbar))

    const elementToMeasure = targetElement ? getLargeSurfaceContainer(targetElement) : document.body
    const luminance = getElementSurfaceLuminance(elementToMeasure)

    if (luminance !== null && Number.isFinite(luminance)) {
      luminanceSamples.push(Math.max(0, Math.min(1, luminance)))
    }
  })

  if (luminanceSamples.length === 0) {
    return null
  }

  return getMedian(luminanceSamples)
}

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
  const cleanPathname = getPathWithoutLocale(pathname)
  const isRouteLikelyLight = cleanPathname === '/pricing' || cleanPathname === '/docs'
  const [isLightSurface, setIsLightSurface] = React.useState<boolean>(isRouteLikelyLight)
  const useDarkForeground = isLightSurface || isMobileMenuOpen

  React.useEffect(() => {
    if(isMobileMenuOpen && isMobile === false) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile, isMobileMenuOpen]);

  React.useEffect(() => {
    setIsLightSurface(isRouteLikelyLight)
  }, [isRouteLikelyLight])

  React.useEffect(() => {
    let timeoutId: number | null = null
    let intervalId: number | null = null

    const evaluateSurface = () => {
      try {
        const surfaceLuminance = getSurfaceLuminanceBelowNavbar()

        if (surfaceLuminance === null) {
          setIsLightSurface(isRouteLikelyLight)
          return
        }

        setIsLightSurface((previousValue) => {
          const threshold = previousValue ? LIGHT_SURFACE_EXIT_THRESHOLD : LIGHT_SURFACE_ENTER_THRESHOLD
          return surfaceLuminance >= threshold
        })
      } catch {
        setIsLightSurface(isRouteLikelyLight)
      }
    }

    const scheduleEvaluation = () => {
      if (timeoutId !== null) {
        return
      }
      timeoutId = window.setTimeout(() => {
        timeoutId = null
        evaluateSurface()
      }, 40)
    }

    scheduleEvaluation()

    window.addEventListener("scroll", scheduleEvaluation, { passive: true })
    window.addEventListener("resize", scheduleEvaluation)
    intervalId = window.setInterval(scheduleEvaluation, 240)

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
      window.removeEventListener("scroll", scheduleEvaluation)
      window.removeEventListener("resize", scheduleEvaluation)
    }
  }, [pathname, isRouteLikelyLight])

  const notShowInView = ['/login', '/oauth/loading', '/meets/loading', '/signup', '/mfa', '/onboarding', `/team/join-team/${params.invitation}`, `/shared/task/${params.token}`]

  if(notShowInView.includes(pathname)) return null; //check how to implement it in ssr, and more gral

  if (isMobile === undefined) return null;

  const handleNavigation = (route: string) => {
    setIsMobileMenuOpen(false);
    router.push(route);
  }

  return (
    <NavigationMenu
      data-landing-navbar="true"
      className={cn(
        "p-2 max-w-full flex items-center justify-between fixed top-2 inset-x-4 z-50 transition-colors duration-300 rounded-lg backdrop-blur-lg border-b shadow-lg",
        useDarkForeground ? "bg-black/10 border-black/10" : "bg-white/10 border-white/10"
      )}
    >
      {isMobile && (
        <div onClick={() => router.push('/')} className="relative h-[30px] w-[30px] cursor-pointer">
          <Image
            src="/gestionate-logo.svg"
            height={30}
            width={30}
            alt="gestionate-logo"
            className={cn("absolute inset-0 transition-opacity duration-300", useDarkForeground ? "opacity-100" : "opacity-0")}
          />
          <Image
            src="/gestionate-logo-white.svg"
            height={30}
            width={30}
            alt="gestionate-logo"
            className={cn("absolute inset-0 transition-opacity duration-300", useDarkForeground ? "opacity-0" : "opacity-100")}
          />
        </div>
      )}

      {!isMobile && (
        <NavigationMenuList className="flex gap-1">
        <div onClick={() => router.push('/')} className="relative mx-2 h-[30px] w-[30px] cursor-pointer">
          <Image
            src="/gestionate-logo.svg"
            height={30}
            width={30}
            alt="gestionate-logo"
            className={cn("absolute inset-0 transition-opacity duration-300", useDarkForeground ? "opacity-100" : "opacity-0")}
          />
          <Image
            src="/gestionate-logo-white.svg"
            height={30}
            width={30}
            alt="gestionate-logo"
            className={cn("absolute inset-0 transition-opacity duration-300", useDarkForeground ? "opacity-0" : "opacity-100")}
          />
        </div>

        <NavigationMenuItem>
          <NavigationMenuTrigger
          className={cn(
            'bg-transparent transition-colors duration-300',
            useDarkForeground ? 'text-black' : 'text-white',
            'data-[state=open]:bg-white data-[state=open]:text-black'
          )}
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
          className={cn(
            'bg-transparent transition-colors duration-300',
            useDarkForeground ? 'text-black' : 'text-white',
            'data-[state=open]:bg-white data-[state=open]:text-black'
          )}

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
            <NavigationMenuLink className={cn(
              navigationMenuTriggerStyle(),
              'bg-transparent transition-colors duration-300',
              useDarkForeground ? 'text-black' : 'text-white'
            )}>
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
              className={cn(
                "mr-3 flex h-9 items-center gap-1 rounded-xl border bg-transparent focus-visible:ring-0 max-sm:mr-0 transition-colors duration-300",
                useDarkForeground
                  ? "border-black/15 text-black hover:bg-black/5 hover:text-black"
                  : "border-white/15 text-white hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="text-sm font-semibold uppercase tracking-wide">{currentLocale}</span>
              <ChevronDown className="h-4 w-4 opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-fit">
            <LanguagesSelection className="flex-col" label={true} />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className={cn("flex items-center gap-2 border-l pl-3 transition-colors duration-300", useDarkForeground ? "border-black/15" : "border-white/15")}>
          <Link href={'/login'}>
            <Button variant='outline' className="rounded-xl">{t('button-signin')}</Button>
          </Link>
          {!isMobile && <Link href={'/pricing'}>
            <Button
              variant={isScrolled || useDarkForeground ? 'default' : 'link'}
              className={cn("rounded-xl transition-colors duration-300", !isScrolled && !useDarkForeground && "text-white")}
            >
              {t('get-started')}
            </Button>
          </Link>}
          {isMobile && (
             <AlignJustify
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn("cursor-pointer transition-colors duration-300", useDarkForeground ? "text-black" : "text-white")}
            />
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
