'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Loader2, MailOpen, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message } from './types'
import '@github/relative-time-element'
import { useTranslations } from 'next-intl'

interface MessageRowProps {
    message: Message
    isSent: boolean
    senderMap: Map<string, string>
    selected: boolean
    onSelect: (id: string) => void
    onOpen: (message: Message) => void
    onFeature: (id: string, featured: boolean) => void
    onDelete: (id: string) => void
    locale: string
    unknownLabel: string
    isDeleting: boolean
    featuredValue: boolean
    isRead: boolean
    isMarkingRead: boolean
    onMarkRead: (id: string) => void
}

const MessageRow = ({
    message,
    isSent,
    senderMap,
    selected,
    onSelect,
    onOpen,
    onFeature,
    onDelete,
    locale,
    unknownLabel,
    isDeleting,
    featuredValue,
    isRead,
    isMarkingRead,
    onMarkRead,
}: MessageRowProps) => {
    const personId = isSent ? message.toTeamMemberId : message.fromTeamMemberId
    const personName = senderMap.get(personId) || unknownLabel
    const isUnread = !isRead && !isSent
    const t = useTranslations('messages-view')

    return (
        <div
            className={cn(
                'flex items-center px-4 py-[10px] border-b gap-3 group transition-colors',
                selected && 'bg-accent/60',
                isUnread
                    ? 'bg-primary/5 border-l-2 border-l-primary/60 hover:bg-primary/10'
                    : 'bg-muted/20 hover:bg-accent/40'
            )}
        >
            <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect(message.$id)}
                onClick={e => e.stopPropagation()}
                aria-label="Select message"
                className="shrink-0"
            />

            <button
                type="button"
                onClick={e => { e.stopPropagation(); onFeature(message.$id, !featuredValue) }}
                className="shrink-0 text-muted-foreground hover:text-yellow-400 transition-colors"
                aria-label="Feature message"
            >
                <Star
                    size={16}
                    className={cn(featuredValue && 'fill-yellow-400 text-yellow-400')}
                />
            </button>

            <button
                type="button"
                onClick={() => onOpen(message)}
                className="flex-1 grid grid-cols-[120px_1fr_auto] sm:grid-cols-[160px_1fr_auto] items-center gap-3 text-left min-w-0"
            >
                <span className={cn(
                    'text-sm truncate',
                    isUnread ? 'font-semibold' : 'text-muted-foreground'
                )}>
                    {personName}
                </span>
                <span className="text-sm truncate min-w-0">
                    <span className={cn(isUnread ? 'font-semibold' : '')}>
                        {message.subject?.trim() || t('no-subject')}
                    </span>
                    <span className="text-muted-foreground font-normal ml-2 hidden sm:inline">
                        {'— '}
                        {message.content}
                    </span>
                </span>
                <relative-time
                    lang={locale}
                    datetime={message.$createdAt}
                    className="text-xs text-muted-foreground shrink-0 whitespace-nowrap"
                />
            </button>

            <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isMarkingRead}
                className={cn(
                    'shrink-0 transition-opacity h-7 w-7',
                    isUnread ? 'opacity-100 text-primary hover:text-primary' : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
                )}
                onClick={e => { e.stopPropagation(); onMarkRead(message.$id) }}
                aria-label="Mark as read"
            >
                {isMarkingRead
                    ? <Loader2 size={14} className="animate-spin" />
                    : <MailOpen size={14} />}
            </Button>

            <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isDeleting}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-7 w-7 disabled:opacity-60"
                onClick={e => { e.stopPropagation(); onDelete(message.$id) }}
                aria-label="Delete message"
            >
                {isDeleting
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />}
            </Button>
        </div>
    )
}

export default MessageRow
