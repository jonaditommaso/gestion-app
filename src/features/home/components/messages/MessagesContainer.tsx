'use client'
import {  Check, MessageSquareText } from "lucide-react" // BellRing,

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useGetMessages } from "../../api/use-get-messages"
import { useGetMembers } from "@/features/team/api/use-get-members"
import '@github/relative-time-element';
import { useLocale, useTranslations } from "next-intl"
import { useBulkReadMessages } from "../../api/use-bulk-read-messages"
import { Skeleton } from "@/components/ui/skeleton"
import { Message } from './types';
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import { useProfilePicture } from "@/hooks/useProfilePicture"
import MessageDetailSheet from "./MessageDetailSheet"

type CardProps = React.ComponentProps<typeof Card>

type MessageSenderInfo = {
  name: string
  userId?: string
  hasPhoto: boolean
}

function MessageSenderAvatar({ sender }: { sender?: MessageSenderInfo | null }) {
  const senderName = sender?.name || 'Unknown sender'
  const hasPhoto = Boolean(sender?.userId && sender.hasPhoto)
  const { imageUrl } = useProfilePicture(sender?.userId, hasPhoto)

  const initials = senderName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'

  return (
    <Avatar className="size-14 shrink-0 rounded-full border bg-muted/60">
      {imageUrl ? <AvatarImage src={imageUrl} alt={senderName} className="object-cover" /> : null}
      <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function MessagesContainer({ className, ...props }: CardProps) {
  const { data: messages, isPending } = useGetMessages();
  const { data: teamData } = useGetMembers();
  const { mutate: markAsRead, isPending: markingReadMessages } = useBulkReadMessages();
  const locale = useLocale();
  const t = useTranslations('home');
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { isDemo } = useAppContext();

  const senderByMembershipId = useMemo(() => {
    const map = new Map<string, MessageSenderInfo>();
    const members = teamData?.members || [];

    for (const member of members) {
      const senderInfo: MessageSenderInfo = {
        name: member.name || member.userName || member.userEmail || 'Unknown sender',
        userId: member.userId,
        hasPhoto: Boolean(member.prefs?.image),
      };

      if (member.appwriteMembershipId) {
        map.set(member.appwriteMembershipId, senderInfo);
      }
      map.set(member.$id, senderInfo);
    }

    return map;
  }, [teamData?.members]);

  const unreadMessages: Message[] = ((messages?.documents ?? []) as unknown as Message[])
  .filter((m): m is Message => 'content' in m && 'toTeamMemberId' in m && 'read' in m && !m.read);

  const handleMarkAsRead = () => {
    if(unreadMessages?.length) {
      markAsRead({
        json: { unreadMessages }
      })
    }
  }

  return (
    <Card className={cn("col-span-1 h-fit", className)} {...props}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquareText className="h-5 w-5 text-cyan-600" />
            {t('messages')}
          </CardTitle>
          <CardDescription>{!messages?.total ? t('not-messages-yet') : `${t('you-have')} ${unreadMessages?.length} ${t('unread-messages')}`}</CardDescription>
        </div>
        <div className="flex items-start gap-2 !m-0">
          {!isDemo && (
            <Button size="sm" className="w-fit" disabled={markingReadMessages || !unreadMessages.length} onClick={handleMarkAsRead}>
              <Check className="mr-1 h-4 w-4" /> {t('mark-all-read')}
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-fit" onClick={() => router.push('/messages')}>
            {t('see-all')}
          </Button>
        </div>
      </CardHeader>
      <div className="flex flex-col justify-between h-[80%]">
        <CardContent className="grid gap-4 pb-2 overflow-auto mb-1">
          <div>
            {isPending ? (
              <div className="w-full">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              (messages?.documents as unknown as Message[])?.map((message, index) => {
                const senderInfo = senderByMembershipId.get(message.fromTeamMemberId);
                const senderName = senderInfo?.name || t('unknown-sender');
                const subject = message.subject?.trim() || t('no-subject');

                return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedMessage(message)}
                  className="relative mb-4 w-full text-left pb-2 pt-2 px-1 rounded-md bg-sidebar hover:bg-sidebar-accent/80 transition-colors border flex items-start gap-2"
                >
                  {!message.read ? <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                  <div className="flex justify-center pt-0.5">
                    <MessageSenderAvatar sender={senderInfo} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs text-muted-foreground leading-none">
                      {t('from')}: {senderName}
                    </p>
                    <p className="text-sm font-semibold leading-none truncate">
                      {subject}
                    </p>
                    <p className="text-sm font-medium line-clamp-2">
                      {message.content}
                    </p>
                    <relative-time lang={locale} datetime={message.$createdAt} className="text-muted-foreground text-xs">
                    </relative-time>
                  </div>
                </button>
              )})
            )}
          </div>
        </CardContent>
      </div>

      <MessageDetailSheet
        open={Boolean(selectedMessage)}
        onOpenChange={(open: boolean) => {
          if (!open) setSelectedMessage(null);
        }}
        message={selectedMessage}
        title={selectedMessage?.subject?.trim() || t('no-subject')}
        description={selectedMessage ? `${t('from')}: ${senderByMembershipId.get(selectedMessage.fromTeamMemberId)?.name || t('unknown-sender')}` : ''}
        locale={locale}
      />
    </Card>
  )
}
