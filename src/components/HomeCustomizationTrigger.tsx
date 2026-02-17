'use client'

import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export const START_HOME_CUSTOMIZATION_EVENT = 'home-customization:start-edit';

const HomeCustomizationTrigger = () => {
  const pathname = usePathname();
  const t = useTranslations('home');
  const isHomePath = pathname === '/';

  if (!isHomePath) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      title={t('personalize-home')}
      aria-label={t('personalize-home')}
      onClick={() => window.dispatchEvent(new CustomEvent(START_HOME_CUSTOMIZATION_EVENT))}
    >
      <Settings2 className="h-4 w-4" />
    </Button>
  );
};

export default HomeCustomizationTrigger;