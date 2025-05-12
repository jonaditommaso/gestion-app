'use client'
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Plus, SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from 'zod';
import { useForm } from "react-hook-form";
import { shortcutSchema } from "../../schemas";
import { useCurrent } from "@/features/auth/api/use-current";
import { TooltipContainer } from "@/components/TooltipContainer";
import dynamic from "next/dynamic";

const ShortcutForm = dynamic(() => import('./ShortcutForm'), {
    loading: () => <div className="h-64 bg-sidebar"></div>,
})

const ShortcutButton = () => {
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const t = useTranslations('home');
    const {data: user, isLoading } = useCurrent();

    const form = useForm<zod.infer<typeof shortcutSchema>>({
        resolver: zodResolver(shortcutSchema),
        defaultValues: {
            text: '',
            link: '',
        }
    });

    const handleNavigation = () => {
        if(user?.prefs?.shortcut) {
            window.open(user?.prefs?.shortcut.split(',')[0])
        }
        return;
    }

    const handlePopoverChange = () => {
        if(user?.prefs?.shortcut) {
            return;
        }

        setPopoverIsOpen(prev => !prev)
    }

    const handleEdition = () => {
        const shortcut = user?.prefs?.shortcut.split(',');
        form.setValue('link', shortcut[0]);
        form.setValue('text', shortcut[1]);

        setPopoverIsOpen(true);
    }


    return (
        <Popover open={popoverIsOpen} onOpenChange={handlePopoverChange}>
            <PopoverTrigger asChild>
                <div className="relative group w-full">
                    <Button className="w-full py-10 h-auto" variant='outline' disabled={popoverIsOpen || isLoading} onClick={handleNavigation}>
                        {user?.prefs?.shortcut
                            ? <><span>{user?.prefs?.shortcut.split(',')[1]}</span> <SquareArrowOutUpRight /></>
                            : <><Plus /> <span>{t('add-shortcut')}</span></>
                        }
                    </Button>
                    {user?.prefs?.shortcut && <div className="p-2 hover:bg-neutral-500 rounded-full absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:text-white" onClick={handleEdition}>
                        <TooltipContainer tooltipText={t('edit')} side="top">
                            <Pencil className="  w-4 h-4" />
                        </TooltipContainer>
                    </div>}
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-2 bg-sidebar w-[350px]">
                <ShortcutForm
                    form={form}
                    setPopoverIsOpen={setPopoverIsOpen}
                />
            </PopoverContent>
        </Popover>
    );
}

export default ShortcutButton;