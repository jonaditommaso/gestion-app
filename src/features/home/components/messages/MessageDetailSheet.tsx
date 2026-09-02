'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ReplyAll, Loader2, Reply, Send, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Message } from './types'

interface MessageDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: Message | null
  title?: string
  description?: string
  locale: string
  conversationMessages?: Message[]
  selectedMessageId?: string
  senderMap?: Map<string, string>
  showReplyComposer?: boolean
  onSendReply?: (targetMessageId: string, content: string) => Promise<boolean> | boolean
  onForward?: (message: Message) => void
  onToggleFeatured?: (id: string, featured: boolean) => void
  getFeaturedValue?: (message: Message) => boolean
  isSendingReply?: boolean
  focusComposerKey?: number
  isConversationLoading?: boolean
}

const MessageDetailSheet = ({
  open,
  onOpenChange,
  message,
  title,
  description,
  locale,
  conversationMessages,
  selectedMessageId,
  senderMap,
  showReplyComposer = false,
  onSendReply,
  onForward,
  onToggleFeatured,
  getFeaturedValue,
  isSendingReply = false,
  focusComposerKey,
  isConversationLoading = false,
}: MessageDetailSheetProps) => {
  const t = useTranslations('messages-view')
  const [replyContent, setReplyContent] = useState('')
  const [replyTargetMessageId, setReplyTargetMessageId] = useState<string | null>(null)
  const [isManualReplyTarget, setIsManualReplyTarget] = useState(false)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const selectedMessageRef = useRef<HTMLDivElement | null>(null)

  const messages = useMemo(() => {
    if (conversationMessages && conversationMessages.length > 0) {
      return [...conversationMessages].sort(
        (a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
      )
    }

    return message ? [message] : []
  }, [conversationMessages, message])

  // const resolvedFromLabel = fromLabel || t('from')
  const resolvedToLabel = t('to')
  const latestMessageId = messages.length > 0 ? messages[messages.length - 1].$id : null

  const replyTargetMessage = useMemo(
    () => messages.find(item => item.$id === replyTargetMessageId) ?? null,
    [messages, replyTargetMessageId]
  )

  useEffect(() => {
    if (!open || !showReplyComposer || focusComposerKey === undefined) return
    composerRef.current?.focus()
  }, [focusComposerKey, open, showReplyComposer])

  useEffect(() => {
    if (!open || !selectedMessageRef.current) return
    selectedMessageRef.current.scrollIntoView({ block: 'center' })
  }, [open, selectedMessageId, messages.length])

  useEffect(() => {
    if (!open) {
      setReplyContent('')
      setReplyTargetMessageId(null)
      setIsManualReplyTarget(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setReplyTargetMessageId(null)
    setIsManualReplyTarget(false)
  }, [open, selectedMessageId])

  useEffect(() => {
    if (!open || messages.length === 0 || !latestMessageId) return

    setReplyTargetMessageId(prev => {
      const previousStillExists = prev ? messages.some(item => item.$id === prev) : false
      if (isManualReplyTarget && previousStillExists) {
        return prev
      }

      return latestMessageId
    })
  }, [isManualReplyTarget, latestMessageId, messages, open])

  const handleSetReplyTarget = (targetId: string) => {
    setReplyTargetMessageId(targetId)
    setIsManualReplyTarget(true)
    composerRef.current?.focus()
  }

  const handleSendReply = async () => {
    const trimmed = replyContent.trim()
    const targetId = replyTargetMessageId || latestMessageId
    if (!trimmed || !onSendReply || isSendingReply || !targetId) return

    const didSend = await Promise.resolve(onSendReply(targetId, trimmed))
    if (didSend) {
      setReplyContent('')
      setIsManualReplyTarget(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[96vw] sm:w-full sm:max-w-3xl flex flex-col">
        <SheetHeader className="pr-8">
          <SheetTitle className="text-base">
            {title || message?.subject?.trim() || t('no-subject')}
          </SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {message && isConversationLoading && (
          <div className="mt-4 flex-1 space-y-4 pr-1 overflow-auto">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {message && !isConversationLoading && (
          <div className="mt-4 flex-1 overflow-auto pr-1">
            {messages.map((item, index) => {
              const senderName = senderMap?.get(item.fromTeamMemberId) || t('unknown-sender')
              const recipientName = senderMap?.get(item.toTeamMemberId) || t('unknown-sender')
              const isSelected = selectedMessageId ? item.$id === selectedMessageId : item.$id === message.$id
              const isReplyTarget = replyTargetMessageId === item.$id
              const featuredValue = getFeaturedValue ? getFeaturedValue(item) : (item.featured ?? false)

              return (
                <div key={item.$id}>
                  <div
                    ref={isSelected ? selectedMessageRef : null}
                    className={cn(
                      'py-4 px-1',
                      isSelected && 'bg-primary/5 rounded-sm',
                      isReplyTarget && 'bg-accent/40 rounded-sm'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{senderName || t('unknown')}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {resolvedToLabel}: {recipientName || t('unknown')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <relative-time
                          lang={locale}
                          datetime={item.$createdAt}
                          className="text-muted-foreground text-xs px-1"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSetReplyTarget(item.$id)}
                          aria-label={t('reply')}
                          className={cn('h-7 w-7', isReplyTarget && 'text-primary')}
                        >
                          <Reply size={14} />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => onForward?.(item)}
                          aria-label={t('forward')}
                          className="h-7 w-7"
                        >
                          <ReplyAll size={14} className='scale-x-[-1]' />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => onToggleFeatured?.(item.$id, !featuredValue)}
                          aria-label={t('featured')}
                          className="h-7 w-7"
                        >
                          <Star size={14} className={cn(featuredValue && 'fill-yellow-400 text-yellow-400')} />
                        </Button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                    {/* <p className="mt-3 text-[11px] text-muted-foreground truncate">
                      {resolvedFromLabel}: {senderName || t('unknown')} · {resolvedToLabel}: {recipientName || t('unknown')}
                    </p> */}
                  </div>

                  {index < messages.length - 1 && <Separator />}
                </div>
              )
            })}
          </div>
        )}

        {showReplyComposer && message && !isConversationLoading && onSendReply && (
          <div className="pt-3 mt-3 shrink-0 space-y-2">
            {replyTargetMessage && (
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                {/* <span className="truncate">
                  {t('replying-to')}: {(senderMap?.get(replyTargetMessage.fromTeamMemberId) || unknownLabel || t('unknown'))}
                </span> */}
                {latestMessageId && replyTargetMessageId !== latestMessageId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setReplyTargetMessageId(latestMessageId)
                      setIsManualReplyTarget(false)
                    }}
                  >
                    {t('reply-latest')}
                  </Button>
                )}
              </div>
            )}

            <Textarea
              ref={composerRef}
              value={replyContent}
              onChange={event => setReplyContent(event.target.value)}
              placeholder={t('reply-placeholder')}
              className="min-h-[120px] resize-none"
              maxLength={1024}
              disabled={isSendingReply}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSendReply}
                disabled={isSendingReply || !replyContent.trim()}
              >
                {isSendingReply ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Send size={14} className="mr-1" />
                )}
                {t('send-reply')}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default MessageDetailSheet
