'use client'

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface LandingRouteTransitionProps {
  children: React.ReactNode;
}

const LANDING_ROUTE_PREFIXES = [
  '/about',
  '/blog',
  '/contact',
  '/docs',
  '/faq',
  '/getting-started',
  '/pricing',
  '/privacy',
  '/products',
  '/terms',
  '/who-we-are',
] as const;

const SUPPORTED_LOCALES = new Set(['en', 'es', 'it']);

const getPathWithoutLocale = (pathname: string): string => {
  const segments = pathname.split('/');
  const locale = segments[1];

  if (!SUPPORTED_LOCALES.has(locale)) {
    return pathname;
  }

  const nextPath = `/${segments.slice(2).join('/')}`;
  return nextPath === '/' ? '/' : nextPath.replace(/\/$/, '') || '/';
};

const isLandingRoute = (pathname: string): boolean => {
  if (pathname === '/') {
    return true;
  }

  return LANDING_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const LandingRouteTransition = ({ children }: LandingRouteTransitionProps) => {
  const pathname = usePathname();
  const cleanPathname = getPathWithoutLocale(pathname);
  const isLandingPath = isLandingRoute(cleanPathname);

  useEffect(() => {
    if (!isLandingPath) {
      return;
    }

    const scrollToHash = () => {
      const hash = window.location.hash.replace('#', '').trim();

      if (!hash) {
        return;
      }

      const targetId = decodeURIComponent(hash);
      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    let timeoutId: number | null = null;

    const scheduleHashScroll = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        scrollToHash();
      }, 80);
    };

    scheduleHashScroll();
    window.addEventListener('hashchange', scheduleHashScroll);

    return () => {
      window.removeEventListener('hashchange', scheduleHashScroll);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname, isLandingPath]);

  return <>{children}</>;
};

export default LandingRouteTransition;