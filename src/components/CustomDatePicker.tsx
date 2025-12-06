'use client'

import { CalendarIcon } from "lucide-react";
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
    hideIcon?: boolean
}

const CustomDatePicker = ({ value, onChange, className, placeholder = 'select-date', hideIcon = false }: CustomDatePickerProps) => {
    const [pickerIsOpen, setPickerIsOpen] = useState(false);
    const t = useTranslations('general');
    const locale = useLocale() as keyof typeof localeMap;
    const dateLocale = localeMap[locale] || enUS;

    const handleSelect = (date: Date) => {
        onChange(date);
        setPickerIsOpen(false);
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
                    { value ? <span className="first-letter:uppercase">{format(value, 'PPP', { locale: dateLocale })}</span> : <span>{t(placeholder)}</span> }
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