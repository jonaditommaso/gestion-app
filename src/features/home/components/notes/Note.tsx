import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Bookmark, Palette, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { useState } from "react";
import { NoteData } from "../../types";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useUpdateNote } from "../../api/use-update-note";

const ColorNoteSelector = dynamic(() => import('./ColorNoteSelector'))

interface NoteProps {
    note: NoteData;
    onEdit: (note: NoteData) => void;
    onDelete: (id: string) => void;
    onUpdateColor: (id: string, color: string) => void;
}

const Note = ({ note, onEdit, onDelete, onUpdateColor }: NoteProps) => {
    const { title, content, bgColor, $id, isPinned, isModern, hasLines } = note;
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const t = useTranslations('home');
    const { theme } = useTheme();
    const { mutate: updateNote } = useUpdateNote();

    const iconClass = `h-4 w-4 ${theme !== 'dark' && bgColor === 'none' ? 'text-slate-900' : 'text-slate-50'}`;

    const handlePinNote = () => {
        updateNote({
            param: { noteId: $id },
            json: {
                isPinned: true,
                pinnedAt: new Date().toISOString()
            }
        });
    };

    const handleUnpinNote = () => {
        updateNote({
            param: { noteId: $id },
            json: {
                isPinned: false,
                pinnedAt: null
            }
        });
    };

    const handleMakeGlobal = () => {
        updateNote({
            param: { noteId: $id },
            json: {
                isPinned: false,
                pinnedAt: null,
                isGlobal: true,
                globalAt: new Date().toISOString()
            }
        });
    };

    const lineColor = bgColor === 'none'
        ? 'rgba(71, 85, 105, 0.22)'
        : 'rgba(255, 255, 255, 0.25)';

    const linesStyle = hasLines
        ? {
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, ${lineColor} 23px, ${lineColor} 24px)`,
        }
        : undefined;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group relative border rounded-md p-3 flex flex-col min-h-[120px] transition-shadow hover:shadow-md overflow-hidden",
                isModern && "shadow-md border-transparent",
                bgColor === 'none' ? 'bg-sidebar' : bgColor
            )}
        >
            {isModern && (
                <>
                    <div
                        className={cn(
                            "absolute left-0 top-0 h-full w-1.5",
                            bgColor === 'none' ? "bg-primary/40" : "bg-white/35"
                        )}
                        aria-hidden="true"
                    />
                    <div
                        className={cn(
                            "absolute inset-0 pointer-events-none",
                            bgColor === 'none'
                                ? "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
                                : "bg-gradient-to-br from-white/25 via-white/5 to-black/20"
                        )}
                        aria-hidden="true"
                    />
                </>
            )}
            <div onClick={() => onEdit(note)} className="cursor-pointer flex-1">
                {title && <h3 className={`font-medium mb-2 line-clamp-1 ${bgColor !== 'none' && 'text-white'}`}>{title}</h3>}
                <div style={linesStyle} className="rounded-sm">
                    <p className={`text-sm leading-6 line-clamp-4 whitespace-pre-wrap pt-0.5 ${bgColor !== 'none' && 'text-white'}`}>
                        {content}
                    </p>
                </div>
            </div>
            <div className="h-8 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1">
                {isPinned ? (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleMakeGlobal();
                            }}
                            title={t('make-global')}
                        >
                            <Bookmark className={iconClass} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleUnpinNote();
                            }}
                            title={t('unpin-note')}
                        >
                            <PinOff className={iconClass} />
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        onClick={(event) => {
                            event.stopPropagation();
                            handlePinNote();
                        }}
                        title={t('pin-note')}
                    >
                        <Pin className={iconClass} />
                    </Button>
                )}
                <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            title={t('change-color')}
                        >
                            <Palette className={iconClass} />
                        </Button>
                    </PopoverTrigger>
                    <ColorNoteSelector onChange={(val) => {
                        onUpdateColor($id, val);
                        setPopoverIsOpen(false);
                    }} />
                </Popover>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={() => onEdit(note)}
                    title={t('edit-note')}
                >
                    <Pencil className={iconClass} />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={() => onDelete($id)}
                    title={t('delete-note')}
                >
                    <Trash2 className={iconClass} />
                </Button>
            </div>
        </motion.div>
    );
}

export default Note;