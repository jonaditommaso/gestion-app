"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import "./time-picker.css" // is not necessary all this, check what I really need

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}
const CustomTimePicker = ({ date, setDate, className }: TimePickerProps) => {
    const roundToNearestFive = (num: number) => Math.round(num / 5) * 5

    const [selectedHour, setSelectedHour] = React.useState<number>(date ? date.getHours() % 12 || 12 : 12)
    const [selectedMinute, setSelectedMinute] = React.useState<number>(date ? roundToNearestFive(date.getMinutes()) : 0)
    const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">(
      date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM",
    )

    // Create hours array (1-12)
    const hours = Array.from({ length: 12 }, (_, i) => i + 1)

    // Create minutes array (00-59) in steps of 5
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

    const handleHourChange = (value: string) => {
      setSelectedHour(Number.parseInt(value))
      updateDate(Number.parseInt(value), selectedMinute, selectedPeriod)
    }

    const handleMinuteChange = (value: string) => {
      setSelectedMinute(Number.parseInt(value))
      updateDate(selectedHour, Number.parseInt(value), selectedPeriod)
    }

    const handlePeriodChange = (value: string) => {
      setSelectedPeriod(value as "AM" | "PM")
      updateDate(selectedHour, selectedMinute, value as "AM" | "PM")
    }

    const updateDate = (hour: number, minute: number, period: "AM" | "PM") => {
      const newDate = new Date()
      let hours = hour

      if (period === "PM" && hour !== 12) {
        hours += 12
      } else if (period === "AM" && hour === 12) {
        hours = 0
      }

      newDate.setHours(hours)
      newDate.setMinutes(minute)
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)

      setDate(newDate)
    }

    return (
      <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size='lg'
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? format(date, "hh:mm a") : <span>Pick a time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex gap-2 items-end">
          <div className="grid gap-1">
            <div className="text-xs font-medium text-muted-foreground">Hour</div>
            <Select value={selectedHour.toString()} onValueChange={handleHourChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="select-content-center">
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    <div className="flex items-center justify-center w-full">{hour.toString().padStart(2, "0")}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <div className="text-xs font-medium text-muted-foreground">Minute</div>
            <Select value={selectedMinute.toString()} onValueChange={handleMinuteChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent className="select-content-center">
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute.toString()}>
                    <div className="flex items-center justify-center w-full">{minute.toString().padStart(2, "0")}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <div className="text-xs font-medium text-muted-foreground">Period</div>
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent className="select-content-center">
                <SelectItem value="AM">
                  <div className="flex items-center justify-center w-full">AM</div>
                </SelectItem>
                <SelectItem value="PM">
                  <div className="flex items-center justify-center w-full">PM</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    );
}

export default CustomTimePicker;