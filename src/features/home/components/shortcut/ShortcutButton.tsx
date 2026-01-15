'use client'
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Plus, SquareArrowOutUpRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from 'zod';
import { useForm } from "react-hook-form";
import { shortcutSchema } from "../../schemas";
import { useCurrent } from "@/features/auth/api/use-current";
import { TooltipContainer } from "@/components/TooltipContainer";
import { useDeleteShortcut } from "../../api/use-delete-shortcut";
import dynamic from "next/dynamic";

const ShortcutForm = dynamic(() => import('./ShortcutForm'), {
    loading: () => <div className="h-64 bg-sidebar"></div>,
})

type ShortcutSlot = 'shortcut' | 'shortcut2';

interface ShortcutItemProps {
    shortcutString: string;
    slot: ShortcutSlot;
    onNavigate: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isLoading?: boolean;
    isDeleting?: boolean;
    className?: string;
}

const ShortcutItem = ({ shortcutString, onNavigate, onEdit, onDelete, isLoading, isDeleting, className }: ShortcutItemProps) => {
    const t = useTranslations('home');
    const parts = shortcutString.split(',');
    const text = parts[1];

    return (
        <div className={`relative group/item ${className}`}>
            <Button
                className="w-full py-8 h-auto rounded-none border-0"
                variant='ghost'
                disabled={isLoading || isDeleting}
                onClick={onNavigate}
            >
                <span className="truncate">{text}</span>
                <SquareArrowOutUpRight className="h-4 w-4 ml-2 shrink-0" />
            </Button>
            {/* Edit & Delete buttons - visible on hover of this item only */}
            <div className="absolute top-4 -translate-y-1/2 right-1 opacity-0 group-hover/item:opacity-100 transition-all duration-200 flex gap-0.5">
                <div
                    className="p-1.5 hover:bg-neutral-500 rounded-full cursor-pointer hover:text-white bg-background/90 border"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                >
                    <TooltipContainer tooltipText={t('edit')} side="left">
                        <Pencil className="w-3 h-3" />
                    </TooltipContainer>
                </div>
                <div
                    className="p-1.5 hover:bg-destructive rounded-full cursor-pointer hover:text-white bg-background/90 border"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                    <TooltipContainer tooltipText={t('delete')} side="left">
                        <X className="w-3 h-3" />
                    </TooltipContainer>
                </div>
            </div>
        </div>
    );
};

const ShortcutButton = () => {
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const t = useTranslations('home');
    const { data: user, isLoading } = useCurrent();
    const { mutate: deleteShortcut, isPending: isDeleting } = useDeleteShortcut();

    const form = useForm<zod.infer<typeof shortcutSchema>>({
        resolver: zodResolver(shortcutSchema),
        defaultValues: {
            text: '',
            link: '',
            slot: 'shortcut',
        }
    });

    const shortcut1 = user?.prefs?.shortcut;
    const shortcut2 = user?.prefs?.shortcut2;
    const hasShortcut1 = !!shortcut1;
    const hasShortcut2 = !!shortcut2;
    const hasBothShortcuts = hasShortcut1 && hasShortcut2;

    const parseShortcut = (shortcutString: string) => {
        const parts = shortcutString.split(',');
        return { link: parts[0], text: parts[1] };
    };

    const handleNavigation = (shortcutString: string) => {
        const { link } = parseShortcut(shortcutString);
        window.open(link);
    };

    const handleAddShortcut = (slot: ShortcutSlot) => {
        form.reset({ text: '', link: '', slot });
        setPopoverIsOpen(true);
    };

    const handleEditShortcut = (slot: ShortcutSlot, shortcutString: string) => {
        const { link, text } = parseShortcut(shortcutString);
        form.setValue('link', link);
        form.setValue('text', text);
        form.setValue('slot', slot);
        setPopoverIsOpen(true);
    };

    const handleDeleteShortcut = (slot: ShortcutSlot) => {
        deleteShortcut({ slot });
    };

    // Estado: Sin ningún shortcut
    if (!hasShortcut1 && !hasShortcut2) {
        return (
            <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        className="w-full py-16 h-auto"
                        variant='outline'
                        disabled={popoverIsOpen || isLoading}
                        onClick={() => handleAddShortcut('shortcut')}
                    >
                        <Plus /> <span>{t('add-shortcut')}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 bg-sidebar w-[350px]">
                    <ShortcutForm form={form} setPopoverIsOpen={setPopoverIsOpen} />
                </PopoverContent>
            </Popover>
        );
    }

    // Estado: Con ambos shortcuts
    if (hasBothShortcuts) {
        return (
            <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                <PopoverTrigger asChild>
                    <div className="w-full">
                        <div className="w-full flex flex-col border rounded-md overflow-hidden">
                            <ShortcutItem
                                shortcutString={shortcut1}
                                slot="shortcut"
                                onNavigate={() => handleNavigation(shortcut1)}
                                onEdit={() => handleEditShortcut('shortcut', shortcut1)}
                                onDelete={() => handleDeleteShortcut('shortcut')}
                                isLoading={isLoading}
                                isDeleting={isDeleting}
                                className="border-b"
                            />
                            <ShortcutItem
                                shortcutString={shortcut2}
                                slot="shortcut2"
                                onNavigate={() => handleNavigation(shortcut2)}
                                onEdit={() => handleEditShortcut('shortcut2', shortcut2)}
                                onDelete={() => handleDeleteShortcut('shortcut2')}
                                isLoading={isLoading}
                                isDeleting={isDeleting}
                            />
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="p-2 bg-sidebar w-[350px]">
                    <ShortcutForm form={form} setPopoverIsOpen={setPopoverIsOpen} />
                </PopoverContent>
            </Popover>
        );
    }

    // Estado: Con solo un shortcut (mostrar el existente + opción de agregar otro)
    const existingShortcut = shortcut1 || shortcut2;
    const existingSlot: ShortcutSlot = shortcut1 ? 'shortcut' : 'shortcut2';
    const emptySlot: ShortcutSlot = shortcut1 ? 'shortcut2' : 'shortcut';

    return (
        <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
            <PopoverTrigger asChild>
                <div className="w-full">
                    <div className="w-full flex flex-col border rounded-md overflow-hidden">
                        <ShortcutItem
                            shortcutString={existingShortcut!}
                            slot={existingSlot}
                            onNavigate={() => handleNavigation(existingShortcut!)}
                            onEdit={() => handleEditShortcut(existingSlot, existingShortcut!)}
                            onDelete={() => handleDeleteShortcut(existingSlot)}
                            isLoading={isLoading}
                            isDeleting={isDeleting}
                        />
                        <div className="border-t border-dashed">
                            <Button
                                className="w-full py-3 h-auto rounded-none border-0 text-muted-foreground hover:text-foreground"
                                variant='ghost'
                                disabled={isLoading}
                                onClick={(e) => { e.stopPropagation(); handleAddShortcut(emptySlot); }}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                <span className="text-xs">{t('add-another-shortcut')}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-2 bg-sidebar w-[350px]">
                <ShortcutForm form={form} setPopoverIsOpen={setPopoverIsOpen} />
            </PopoverContent>
        </Popover>
    );
}

export default ShortcutButton;