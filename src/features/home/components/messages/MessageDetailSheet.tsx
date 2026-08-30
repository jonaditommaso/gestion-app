'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Message } from './types'

interface MessageDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: Message | null
  title?: string
  description?: string
  locale: string
}

const MessageDetailSheet = ({
  open,
  onOpenChange,
  message,
  title,
  description,
  locale,
}: MessageDetailSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] sm:w-full sm:max-w-md">
        <SheetHeader className="pr-8">
          <SheetTitle className="text-base">
            {title || message?.subject?.trim() || 'No subject'}
          </SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {message && (
          <div className="mt-4 space-y-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <relative-time
              lang={locale}
              datetime={message.$createdAt}
              className="text-muted-foreground text-xs block"
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default MessageDetailSheet
