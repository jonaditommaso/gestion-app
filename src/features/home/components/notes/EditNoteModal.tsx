'use client'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { useUpdateNote } from "../../api/use-update-note";
import { useDeleteNote } from "../../api/use-delete-note";
import { Palette, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { NoteData } from "../../types";

const ColorNoteSelector = dynamic(() => import('./ColorNoteSelector'))

interface EditNoteModalProps {
    note: NoteData;
    isOpen: boolean;
    onClose: () => void;
}

const EditNoteModal = ({ note, isOpen, onClose }: EditNoteModalProps) => {
    const [title, setTitle] = useState(note.title || '');
    const [content, setContent] = useState(note.content);
    const [bgColor, setBgColor] = useState(note.bgColor);
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

    const { mutate: updateNote } = useUpdateNote();
    const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote();
    const t = useTranslations('home');

    useEffect(() => {
        if (isOpen) {
            setTitle(note.title || '');
            setContent(note.content);
            setBgColor(note.bgColor);

            // Enfocar el input correcto después de que el modal se abra
            setTimeout(() => {
                if (!note.title) {
                    titleInputRef.current?.focus();
                } else {
                    contentTextareaRef.current?.focus();
                    // Mover el cursor al final del contenido
                    const length = content.length;
                    contentTextareaRef.current?.setSelectionRange(length, length);
                }
            }, 100);
        }
    }, [isOpen, note, content]);

    const handleBlur = () => {
        if ((!title && !content)) {
            return;
        }
        if (title !== note.title || content !== note.content || bgColor !== note.bgColor) {
            updateNote({
                param: { noteId: note.$id },
                json: { title, content, bgColor }
            });
        }
    };

    const handleClose = () => {
        handleBlur();
        onClose();
    };

    const handleDelete = () => {
        deleteNote({ param: { noteId: note.$id } });
        onClose();
    };

    const handleColorChange = (value: string) => {
        setBgColor(value);
        setPopoverIsOpen(false);
        if (value !== note.bgColor && (title || content)) {
            updateNote({
                param: { noteId: note.$id },
                json: { title, content, bgColor: value }
            });
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                className="p-0 border-none shadow-none bg-transparent max-w-lg overflow-hidden [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:border-none [&>button]:shadow-none"
            >
                <DialogTitle className="sr-only">{t('edit-note')}</DialogTitle>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={`relative flex flex-col w-full rounded-lg shadow-2xl overflow-hidden ${bgColor === 'none' ? 'bg-sidebar' : bgColor}`}
                >
                    <div className="p-4 flex flex-col gap-3">
                        <Input
                            ref={titleInputRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleBlur}
                            placeholder={t('title')}
                            className="text-base font-semibold border-none shadow-none focus-visible:ring-0 bg-transparent px-0 text-white placeholder:text-white/60"
                        />
                        <Textarea
                            ref={contentTextareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onBlur={handleBlur}
                            placeholder={t('remember-placeholder')}
                            className="resize-none min-h-[120px] max-h-[300px] border-none shadow-none focus-visible:ring-0 bg-transparent px-0 text-sm text-white placeholder:text-white/60"
                        />
                    </div>

                    <div className="px-2 pb-2 flex justify-end items-center gap-1">
                        <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-black/20 dark:hover:bg-white/20"
                                    title={t('change-color')}
                                >
                                    <Palette className="h-4 w-4 text-white" />
                                </Button>
                            </PopoverTrigger>
                            <ColorNoteSelector onChange={(val) => handleColorChange(val)} />
                        </Popover>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-full hover:bg-black/20 dark:hover:bg-white/20"
                            title={t('delete-note')}
                        >
                            <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default EditNoteModal;
