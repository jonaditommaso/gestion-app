'use client'

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        umami?: {
            track: (eventName: string) => void
        }
    }
}

const DemoButton = ({ text, fit, link }: { text: string, fit?: boolean, link?: boolean }) => {
    const isMobile = useIsMobile();
    const router = useRouter();

    const handleGetDemo = () => {
        document.cookie = 'isDemo=true; path=/';
        window.umami?.track('demo_started')
        router.refresh();
    }

    return (
        <Button
            className={cn(fit ? 'w-fit' : "w-full", link && 'text-white underline p-0')}
            size={isMobile ? 'sm' : 'lg'}
            type="button"
            variant={link ? 'link' : 'success'}
            onClick={handleGetDemo}
        >
            {text} {link ? <ArrowRight size={16} className="text-blue-100/80" /> : null}
        </Button>
    );
}

export default DemoButton;