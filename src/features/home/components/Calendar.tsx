"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Bell } from "lucide-react"
import { isSameDay, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { useGetNotes } from "../api/use-get-notes"
import { NoteData } from "../types"

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const { data } = useGetNotes()
  const notes = (data?.documents || []) as NoteData[]

  const reminderNotes = notes.filter(n => !!n.reminderAt)
  const reminderDates = reminderNotes.map(n => new Date(n.reminderAt!))

  const selectedDateNotes = date
    ? reminderNotes.filter(n => isSameDay(new Date(n.reminderAt!), date))
    : []

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border col-span-1"
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
          DayContent: ({ date: dayDate }: { date: Date }) => {
            const hasReminder = reminderDates.some(d => isSameDay(d, dayDate))
            return (
              <div className="relative flex items-center justify-center w-full h-full">
                <span>{dayDate.getDate()}</span>
                {hasReminder && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-amber-400" />
                )}
              </div>
            )
          }
        }}
      />
      {selectedDateNotes.length > 0 && (
        <div className="mt-2 px-1 space-y-1.5">
          {selectedDateNotes.map(note => (
            <div key={note.$id} className="text-xs p-2 rounded-md bg-accent flex items-start gap-2">
              <Bell className="h-3 w-3 mt-0.5 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {note.title || note.content?.slice(0, 40)}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(note.reminderAt!), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
