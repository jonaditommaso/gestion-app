'use client'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCreateNote } from "../../api/use-create-note";
import { Palette, Pin } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const ColorNoteSelector = dynamic(() => import('./ColorNoteSelector'))

interface CreateNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultIsModern: boolean;
    defaultHasLines: boolean;
}

const CreateNoteModal = ({ isOpen, onClose, defaultIsModern, defaultHasLines }: CreateNoteModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [bgColor, setBgColor] = useState('none');
    const [isPinned, setIsPinned] = useState(false);
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);

    const { mutate: createNote } = useCreateNote();
    const t = useTranslations('home');

    const resetState = () => {
        setTitle('');
        setContent('');
        setBgColor('none');
        setIsPinned(false);
        setPopoverIsOpen(false);
    };

    const handleCreate = () => {
        createNote({
            json: {
                title,
                content,
                bgColor,
                isModern: defaultIsModern,
                hasLines: defaultHasLines,
                isPinned,
                pinnedAt: isPinned ? new Date().toISOString() : null,
            }
        });
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            if (title || content) {
                handleCreate();
            }
            resetState();
            onClose();
        }
    };

    const handleDiscard = () => {
        resetState();
        onClose();
    };

    const handleColorChange = (value: string) => {
        setBgColor(value);
        setPopoverIsOpen(false);
    };

    if (!isOpen) return null;

    const isNoneColor = bgColor === 'none';
    const textColorClass = isNoneColor ? '' : 'text-white';
    const placeholderColorClass = isNoneColor ? 'placeholder:text-muted-foreground' : 'placeholder:text-white/60';
    const iconColorClass = isNoneColor ? '' : 'text-white';

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="p-0 border-none shadow-none bg-transparent max-w-lg overflow-hidden [&>button]:hidden">
                <DialogTitle className="sr-only">{t('add-note')}</DialogTitle>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={`relative flex flex-col w-full rounded-lg shadow-2xl overflow-hidden ${bgColor === 'none' ? 'bg-sidebar' : bgColor}`}
                >
                    <div className="p-4 flex flex-col gap-3">
                        <Input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('title')}
                            className={cn(
                                "text-base font-semibold border-none shadow-none focus-visible:ring-0 bg-transparent px-0",
                                textColorClass,
                                placeholderColorClass
                            )}
                        />
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t('remember-placeholder')}
                            className={cn(
                                "resize-none min-h-[120px] max-h-[300px] border-none shadow-none focus-visible:ring-0 bg-transparent px-0 text-sm",
                                textColorClass,
                                placeholderColorClass
                            )}
                        />
                    </div>

                    <div className="px-2 pb-2 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={handleDiscard}
                            className={cn(
                                "text-sm",
                                isNoneColor
                                    ? "text-muted-foreground hover:text-foreground"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {t('discard-note')}
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsPinned(prev => !prev)}
                                className="rounded-full hover:bg-black/20 dark:hover:bg-white/20"
                                title={t('pin-note')}
                            >
                                <Pin className={cn("h-4 w-4", isPinned && "fill-current", iconColorClass)} />
                            </Button>
                            <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full hover:bg-black/20 dark:hover:bg-white/20"
                                        title={t('change-color')}
                                    >
                                        <Palette className={cn("h-4 w-4", iconColorClass)} />
                                    </Button>
                                </PopoverTrigger>
                                <ColorNoteSelector onChange={(val) => handleColorChange(val)} />
                            </Popover>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateNoteModal;
