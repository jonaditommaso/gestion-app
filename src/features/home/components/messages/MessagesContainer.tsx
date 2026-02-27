'use client'
import { DialogContainer } from "@/components/DialogContainer"
import {  Check } from "lucide-react" // BellRing,

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useGetMessages } from "../../api/use-get-messages"
import { useGetMembers } from "@/features/team/api/use-get-members"
import '@github/relative-time-element';
import { useLocale, useTranslations } from "next-intl"
import FadeLoader from "react-spinners/FadeLoader"
import { useBulkReadMessages } from "../../api/use-bulk-read-messages"
import { Message } from './types';
import { useMemo, useState } from "react";

type CardProps = React.ComponentProps<typeof Card>

export function MessagesContainer({ className, ...props }: CardProps) {
  const { data: messages, isPending } = useGetMessages();
  const { data: teamData } = useGetMembers();
  const { mutate: markAsRead, isPending: markingReadMessages } = useBulkReadMessages();
  const locale = useLocale();
  const t = useTranslations('home');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const senderByMembershipId = useMemo(() => {
    const map = new Map<string, string>();
    const members = teamData?.members || [];

    for (const member of members) {
      if (member.appwriteMembershipId) {
        map.set(member.appwriteMembershipId, member.name || member.userName || member.userEmail);
      }
      map.set(member.$id, member.name || member.userName || member.userEmail);
    }

    return map;
  }, [teamData?.members]);

  const unreadMessages: Message[] = (messages?.documents ?? [])
  .filter((m): m is Message => 'content' in m && 'toTeamMemberId' in m && 'read' in m && !m.read);

  const handleMarkAsRead = () => {
    if(unreadMessages?.length) {
      markAsRead({
        json: { unreadMessages }
      })
    }
  }

  return (
    <Card className={cn("col-span-1 bg-sidebar-accent max-h-[355px]", className)} {...props}>
      <CardHeader className="py-4">
        <CardTitle>{t('messages')}</CardTitle>
        <CardDescription>{!messages?.total ? t('not-messages-yet') : `${t('you-have')} ${unreadMessages?.length} ${t('unread-messages')}`}</CardDescription>
      </CardHeader>
      <div className="flex flex-col justify-between h-[80%]">
        <CardContent className="grid gap-4 pb-2 overflow-auto mb-1">
          <div>
            {isPending ? (
              <div className="w-full flex justify-center">
                <FadeLoader color="#999" width={3} className="mt-5" />
              </div>
            ) : (
              (messages?.documents as unknown as Message[])?.map((message, index) => {
                const senderName = senderByMembershipId.get(message.fromTeamMemberId) || t('unknown-sender');
                const subject = message.subject?.trim() || t('no-subject');

                return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedMessage(message)}
                  className={cn("mb-4 w-full text-left grid grid-cols-[25px_1fr] items-start pb-2 pt-2 px-1 rounded-md bg-sidebar hover:bg-sidebar-accent/80 transition-colors", !message.read ? 'border-blue-600 border-2' : '')}
                >
                  {/* improve styles in order to dont return always a span */}
                  {message.read ? <span className="flex h-2 w-2 ml-1 mt-1"></span> : <span className="flex h-2 w-2 ml-1 mt-1 rounded-full bg-blue-600" />}
                  <div className="space-y-1">
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
        <CardFooter className='p-2 my-1'>
          <Button className="w-full" disabled={markingReadMessages || !unreadMessages.length} onClick={handleMarkAsRead}>
            <Check /> {t('mark-all-read')}
          </Button>
        </CardFooter>
      </div>

      <DialogContainer
        title={selectedMessage?.subject?.trim() || t('no-subject')}
        description={selectedMessage ? `${t('from')}: ${senderByMembershipId.get(selectedMessage.fromTeamMemberId) || t('unknown-sender')}` : ''}
        isOpen={Boolean(selectedMessage)}
        setIsOpen={(open: boolean) => {
          if (!open) setSelectedMessage(null);
        }}
      >
        {selectedMessage && (
          <div className="space-y-3">
            <p className="text-sm whitespace-pre-wrap">{selectedMessage.content}</p>
            <relative-time lang={locale} datetime={selectedMessage.$createdAt} className="text-muted-foreground text-xs block" />
          </div>
        )}
      </DialogContainer>
    </Card>
  )
}
