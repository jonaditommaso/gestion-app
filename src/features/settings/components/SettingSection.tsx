import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

interface SettingSectionProps {
    title: string,
    type: undefined | 'destructive',
    children: React.ReactNode
}

const SettingSection = async ({ title, type, children }: SettingSectionProps) => {
    const t = await getTranslations('settings')

    return (
        <div className="min-w-[500px] mb-16">
            <p className={cn("text-xl", type === 'destructive' ? 'text-red-600' : '')}>{t(title)}</p>
            <Separator className={cn("mt-1 mb-4", type === 'destructive' ? 'bg-red-600' : '')} />
            {children}
        </div>
    );
}

export default SettingSection;