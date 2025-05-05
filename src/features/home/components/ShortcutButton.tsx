'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Plus, SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAddShortcut } from "../api/use-add-shortcut";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from 'zod';
import { useForm } from "react-hook-form";
import { shortcutSchema } from "../schemas";
import { Separator } from "@/components/ui/separator";
import { useCurrent } from "@/features/auth/api/use-current";
import { TooltipContainer } from "@/components/TooltipContainer";

const ShortcutButton = () => {
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const { mutate: addShortcut, isPending } = useAddShortcut();
    const t = useTranslations('home');
    const {data: user, isLoading } = useCurrent();

    const form = useForm<zod.infer<typeof shortcutSchema>>({
        resolver: zodResolver(shortcutSchema),
        defaultValues: {
            text: '',
            link: '',
        }
    });

    const onSubmit = (values: zod.infer<typeof shortcutSchema>) => {
        addShortcut({ json: values})
        setPopoverIsOpen(false);
    }

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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                name="link"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="w-[90%] m-auto">
                                        <Label>Link</Label>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t('paste-link')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="text"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="w-[90%] m-auto mt-8">
                                        <Label>{t('text')}</Label>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={t('text-display')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        <Separator className="my-4" />
                        <div className="flex items-center gap-2 justify-center p-2">
                            <Button className="w-full" variant='secondary' size='sm' type="button" onClick={() => setPopoverIsOpen(false)} disabled={isPending}>{t('cancel')}</Button>
                            <Button className="w-full" size='sm' type="submit" disabled={isPending}>{t('add')}</Button>
                        </div>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    );
}

export default ShortcutButton;