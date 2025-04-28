'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import Note from './Note';
import { useState } from "react";
import ColorNoteSelector from "./ColorNoteSelector";
import { useGetNotes } from "../api/use-get-notes";
import FadeLoader from "react-spinners/FadeLoader";
import { useCreateNote } from "../api/use-create-note";
import { useTranslations } from "next-intl";

const INITIAL_STATE_NOTE = {
    title: '',
    content: '',
    bgColor: 'none'
}

const MyNotes = () => {
    const { data, isPending } = useGetNotes();
    const { mutate: createNote, isPending: isCreatingNote } = useCreateNote()
    const [newNote, setNewNote] = useState(INITIAL_STATE_NOTE);
    const t = useTranslations('home')

    const onChange = (value: string, field: 'title' | 'content' | 'bgColor') => {
        setNewNote(prev => {
            return {
                ...prev,
                [field]: value
            }
        })
    }

    const handleCreateNote = () => {
        createNote({ json: newNote });
        setNewNote(INITIAL_STATE_NOTE)
    }

    if (isPending) return (
        <div className="w-full flex justify-center row-span-2">
            <FadeLoader color="#999" width={3} className="mt-5" />
        </div>
    )

    return (
        <Card className="col-span-1 row-span-2 flex flex-col justify-start items-center bg-sidebar-accent">
            <CardTitle className="p-4">{t('my-notes')}</CardTitle>
            <CardContent className="flex flex-col gap-y-4 w-full mt-2">
                <div className="flex flex-col gap-2">
                    <Input
                        placeholder={t('title')}
                        className="bg-sidebar"
                        value={newNote.title}
                        onChange={(e) => onChange(e.target.value, 'title')}
                    />
                    <div className="relative">
                        <Textarea
                            placeholder={t('remember-placeholder')}
                            maxLength={256}
                            className="resize-none h-40 bg-sidebar"
                            value={newNote.content}
                            onChange={(e) => onChange(e.target.value, 'content')}
                        />
                        <div className="absolute bottom-1.5 right-2 text-xs text-muted-foreground pointer-events-none">
                            {newNote.content.length}/256
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <ColorNoteSelector onChange={onChange} />
                        <Button onClick={handleCreateNote} disabled={isCreatingNote || (!newNote.content && !newNote.title)}>
                            <Plus /> {t('add-note')}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 justify-center">
                    {data?.documents.map(note => (
                        <Note
                            key={note.$id}
                            title={note.title}
                            content={note.content}
                            bgColor={note.bgColor}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default MyNotes;