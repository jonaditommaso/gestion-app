'use client'

import { useMemo, useState } from 'react'
import { AtSign } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover'
import { useTranslations } from 'next-intl'

interface MentionDialogProps {
    memberOptions: { id: string, name: string }[]
    onInsertMention: (member: { id: string, name: string }, savedRange?: Range) => void
}

const MentionDialog = ({ memberOptions, onInsertMention }: MentionDialogProps) => {
    const t = useTranslations('workspaces')
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [savedRange, setSavedRange] = useState<Range | null>(null)

    const filteredMembers = useMemo(() => {
        if (!search.trim()) {
            return memberOptions
        }

        const normalizedSearch = search.toLowerCase()
        return memberOptions.filter((member) =>
            member.name.toLowerCase().includes(normalizedSearch)
        )
    }, [memberOptions, search])

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                setSavedRange(selection.getRangeAt(0).cloneRange())
            }
        } else {
            setSearch('')
            setSavedRange(null)
        }

        setOpen(nextOpen)
    }

    const handleSelectMember = (member: { id: string, name: string }) => {
        onInsertMention(member, savedRange || undefined)
        handleOpenChange(false)
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    title={t('mention')}
                >
                    <AtSign className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2">
                <div className="space-y-2">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('select-assignee')}
                    />
                    <div className="max-h-56 overflow-auto">
                        {filteredMembers.length === 0 ? (
                            <div className="px-2 py-2 text-sm text-muted-foreground">
                                {t('no-members-available')}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredMembers.map((member) => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => handleSelectMember(member)}
                                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    >
                                        @{member.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default MentionDialog
