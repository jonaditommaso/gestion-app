'use client'

import { Button } from "@/components/ui/button";
import { useRegister } from "@/features/auth/api/use-register";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, generateInviteCode } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const DemoButton = ({ text, fit, link }: { text: string, fit?: boolean, link?: boolean }) => {
    const { mutate: demoRegister, isPending } = useRegister();
    const isMobile = useIsMobile();

    const handleGetDemo = () => {
        demoRegister({
            json: {
                company: 'Demo Org.',
                name: 'Demo User',
                email: `user${generateInviteCode(6)}@demo.com`,
                password: 'Demo12345678',
                plan: 'pro',
                isDemo: true
            }
        })

    }

    return (
        <Button
            className={cn(fit ? 'w-fit' : "w-full", link && 'text-white underline p-0')}
            size={isMobile ? 'sm' : 'lg'}
            type="button"
            variant={link ? 'link' : 'success'}
            onClick={() => handleGetDemo()}
            disabled={isPending}
        >
            {text} {link ? <ArrowRight size={16} className="text-blue-100/80" /> : null}
        </Button>
    );
}

export default DemoButton;