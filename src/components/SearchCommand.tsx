'use client'
import {
  NotepadText,
  ReceiptText,
  User,
  UserRoundSearch,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  //CommandSeparator,
} from "@/components/ui/command"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const items = [
  { label: "billing", icon: <ReceiptText className="mr-2 h-4 w-4" />, path: "/billing-management", shortcut: "j" },
  { label: "records", icon: <UserRoundSearch className="mr-2 h-4 w-4" />, path: "/records", shortcut: "r" },
  { label: "workspaces", icon: <NotepadText className="mr-2 h-4 w-4" />, path: "/workspaces", shortcut: "w" },
  { label: "profile", icon: <User className="mr-2 h-4 w-4" />, path: "/settings", shortcut: "p" },
];

const SearchCommand = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const t = useTranslations('app')

  const handleInputClick = () => setIsOpen(true);

  const handleOutsideClick = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
    setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    const handleKeydown = (event: KeyboardEvent) => {
      // open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((prev) => {
          const newState = !prev;
          if (!prev) {

            // wait input mounted
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }
          return newState;
        });
      }

      // custom shortcuts for item
      items.forEach(({ shortcut, path }) => {
        if ((event.ctrlKey || event.metaKey) && event.key === shortcut) {
          event.preventDefault();
          setIsNavigating(true);
          handleNavigation(path);
        }
      });
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeydown);
      setIsNavigating(false)
    };
  }, [isOpen]);

  return (
    <div className="flex p-2 ml-1 relative h-14" ref={containerRef}>
      <Command className="rounded-lg border shadow-sm md:min-w-[250px] lg:max-w-8">
        <CommandInput
          placeholder={t('search')}
          onClick={handleInputClick}
          ref={inputRef}
          disabled={isNavigating}
          autoFocus
        />
        {isOpen && <div className="absolute top-full w-full bg-white shadow-md z-50">

          <CommandList className="bg-sidebar">
            <CommandEmpty>{t('no-results-found')}</CommandEmpty>
            {/*<CommandSeparator /> */}
            <CommandGroup heading={t('commands')}>
              {(items ?? []).map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => handleNavigation(item.path)}
                  >
                    {item.icon}
                    <span>{t(item.label)}</span>
                    <CommandShortcut>⌘{item.shortcut.toUpperCase()}</CommandShortcut>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </div>}
      </Command>
    </div>
  )
}

export default SearchCommand;