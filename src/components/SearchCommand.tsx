'use client'
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useEffect, useRef, useState } from "react";

const SearchCommand = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleInputClick = () => setIsOpen(true);

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      } else {
        document.removeEventListener("mousedown", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isOpen]);

  return (
    <div className="flex p-2 ml-1 relative h-14" ref={containerRef}>
      <Command className="rounded-lg border shadow-sm md:min-w-[250px] lg:max-w-8">
        <CommandInput placeholder="Buscar..." onClick={handleInputClick} />
        {isOpen && <div className="absolute top-full w-full bg-white shadow-md z-50">

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
            <CommandItem>
                <Calendar />
                <span>Calendar</span>
            </CommandItem>
            <CommandItem>
                <Smile />
                <span>Search Emoji</span>
            </CommandItem>
            <CommandItem disabled>
                <Calculator />
                <span>Calculator</span>
            </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
            <CommandItem>
                <User />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
                <CreditCard />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
                <Settings />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>}
      </Command>
    </div>
  )
}

export default SearchCommand;