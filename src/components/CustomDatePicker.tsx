'use client'

import { CalendarIcon, XIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

const localeMap = {
    es: es,
    en: enUS,
    it: it
};

interface CustomDatePickerProps {
    value: Date | undefined,
    onChange: (date: Date) => void,
    className?: string,
    placeholder?: string,
    hideIcon?: boolean,
    label?: string,
    onClear?: () => void,
    clearButtonTitle?: string,
    placeholderText?: string,
}

const CustomDatePicker = ({
    value,
    onChange,
    className,
    placeholder = 'select-date',
    hideIcon = false,
    label,
    onClear,
    clearButtonTitle,
    placeholderText,
}: CustomDatePickerProps) => {
    const [pickerIsOpen, setPickerIsOpen] = useState(false);
    const t = useTranslations('general');
    const locale = useLocale() as keyof typeof localeMap;
    const dateLocale = localeMap[locale] || enUS;

    const handleSelect = (date: Date) => {
        onChange(date);
        setPickerIsOpen(false);
    }

    const formattedValue = value ? format(value, 'PPP', { locale: dateLocale }) : (placeholderText || t(placeholder));
    const displayValue = label ? `${label}: ${formattedValue}` : formattedValue;

    const handleClear = (event: { preventDefault: () => void; stopPropagation: () => void; }) => {
        event.preventDefault();
        event.stopPropagation();
        onClear?.();
    }

    return (
        <Popover open={pickerIsOpen} onOpenChange={setPickerIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    size='default' // lg
                    className={cn(
                        'w-full justify-start text-left font-normal px-3',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    {!hideIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
                    <span className="first-letter:uppercase line-clamp-1">{displayValue}</span>
                    {value && onClear && (
                        <span className="ml-auto pl-2">
                            <span
                                className="inline-flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                                onClick={handleClear}
                                aria-label={clearButtonTitle || t('clear-date')}
                                title={clearButtonTitle || t('clear-date')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        handleClear(event);
                                    }
                                }}
                            >
                                <XIcon className="h-4 w-4" />
                            </span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 rounded-sm border z-[100]"
                align="start"
                sideOffset={4}
            >
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date)=> handleSelect(date as Date)}
                    initialFocus
                    locale={dateLocale}
                />
            </PopoverContent>
        </Popover>
    );
}

export default CustomDatePicker;