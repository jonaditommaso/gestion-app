"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { UserPlus } from "lucide-react"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  className?: string
  disabled?: boolean
  currentUserId?: string
  showAssignToMe?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  disabled = false,
  currentUserId,
  showAssignToMe = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations('workspaces')

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleAssignToMe = () => {
    if (currentUserId && !selected.includes(currentUserId)) {
      onChange([...selected, currentUserId])
    }
  }

  const isCurrentUserSelected = currentUserId ? selected.includes(currentUserId) : false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <div
          className={cn(
            "flex cursor-pointer min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((opt) => opt.value === value)
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {option?.label}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(value)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={() => handleUnselect(value)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground">{t('select-items')}</span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={t('search')} />
          <CommandList>
            <CommandEmpty>{t('no-results-found')}</CommandEmpty>

            {showAssignToMe && currentUserId && !isCurrentUserSelected && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleAssignToMe}
                    className="cursor-pointer"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('assign-to-me')}
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
