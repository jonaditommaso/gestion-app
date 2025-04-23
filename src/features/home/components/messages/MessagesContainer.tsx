'use client'
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
import '@github/relative-time-element';
import { useLocale } from "next-intl"
import FadeLoader from "react-spinners/FadeLoader"
import { useBulkReadMessages } from "../../api/use-bulk-read-messages"
import { Message } from './types';

type CardProps = React.ComponentProps<typeof Card>

export function MessagesContainer({ className, ...props }: CardProps) {
  const { data: messages, isPending } = useGetMessages();
  const { mutate: markAsRead, isPending: markingReadMessages } = useBulkReadMessages();
  const locale = useLocale();

  if (isPending) return (
    <div className="w-full flex justify-center row-span-2">
      <FadeLoader color="#999" width={3} className="mt-5" />
    </div>
  )

  const unreadMessages: Message[] = (messages?.documents ?? [])
  .filter((m): m is Message => 'content' in m && 'to' in m && 'read' in m && !m.read);

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
        <CardTitle>Messages</CardTitle>
        <CardDescription>You have {unreadMessages?.length} unread messages.</CardDescription>
      </CardHeader>
      <div className="flex flex-col justify-between h-[80%]">
        <CardContent className="grid gap-4 pb-2 overflow-auto mb-1">
          <div>
            {messages?.documents?.map((message, index) => (
              <div
                key={index}
                className={cn("mb-4 grid grid-cols-[25px_1fr] items-start pb-2 pt-2 px-1 rounded-md bg-sidebar", !message.read ? 'border-blue-600 border-2' : '')}
              >
                {/* improve styles in order to dont return always a span */}
                {message.read ? <span className="flex h-2 w-2 ml-1 mt-1"></span> : <span className="flex h-2 w-2 ml-1 mt-1 rounded-full bg-blue-600" />}
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {message.content}
                  </p>
                  <relative-time lang={locale} datetime={message.$createdAt} className="text-muted-foreground text-xs">
                  </relative-time>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className='p-2 my-1'>
          <Button className="w-full" disabled={markingReadMessages || !unreadMessages.length} onClick={handleMarkAsRead}>
            <Check /> Mark all as read
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}
