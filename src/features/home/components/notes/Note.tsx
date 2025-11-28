import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Palette, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { useState } from "react";
import { NoteData } from "../../types";
import { useTranslations } from "next-intl";

const ColorNoteSelector = dynamic(() => import('./ColorNoteSelector'))

interface NoteProps {
    note: NoteData;
    onEdit: (note: NoteData) => void;
    onDelete: (id: string) => void;
    onUpdateColor: (id: string, color: string) => void;
}

const Note = ({ note, onEdit, onDelete, onUpdateColor }: NoteProps) => {
    const { title, content, bgColor, $id } = note;
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const t = useTranslations('home');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group relative border rounded-md p-3 flex flex-col min-h-[120px] transition-shadow hover:shadow-md",
                bgColor === 'none' ? 'bg-sidebar' : bgColor
            )}
        >
            <div onClick={() => onEdit(note)} className="cursor-pointer flex-1">
                {title && <h3 className={`font-medium mb-2 line-clamp-1 ${bgColor !== 'none' && 'text-white'}`}>{title}</h3>}
                <p className={`text-sm line-clamp-4 whitespace-pre-wrap ${bgColor !== 'none' && 'text-white'}`}>
                    {content}
                </p>
            </div>
            <div className="h-8 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1">
                <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            title={t('change-color')}
                        >
                            <Palette className="h-4 w-4 text-slate-50" />
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
                    <Pencil className="h-4 w-4 text-slate-50" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={() => onDelete($id)}
                    title={t('delete-note')}
                >
                    <Trash2 className="h-4 w-4 text-slate-50" />
                </Button>
            </div>
        </motion.div>
    );
}

export default Note;