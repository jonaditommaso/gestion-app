import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations('not-found');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-[size:40px_40px]" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center max-w-2xl">
        {/* 404 Number with gradient */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse max-sm:text-7xl">
            404
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-foreground mb-4 max-sm:text-2xl">
          {t('title')}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-8 max-w-md max-sm:text-base">
          {t('description')}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              {t('button-home')}
            </Link>
          </Button>
        </div>

        {/* Additional help text */}
        {/* <div className="mt-12 p-6 rounded-lg bg-muted/50 backdrop-blur-sm border border-border max-w-md">
          <p className="text-sm text-muted-foreground text-balance">
            ¿Necesitas ayuda? Visita nuestra{" "}
            <Link
              href="/docs"
              className="text-primary hover:underline font-medium"
            >
              documentación
            </Link>
            {" "}o contacta al{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              soporte
            </Link>
            .
          </p>
        </div> */}
      </div>
    </div>
  );
}
