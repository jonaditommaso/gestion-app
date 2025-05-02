'use client'

import { CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "./ui/calendar";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface CustomDatePickerProps {
    value: Date | undefined,
    onChange: (date: Date) => void,
    className?: string,
    placeholder?: string
}

const CustomDatePicker = ({ value, onChange, className, placeholder = 'select-date' }: CustomDatePickerProps) => {
    const [pickerIsOpen, setPickerIsOpen] = useState(false);
    const t = useTranslations('general');
    const { theme } = useTheme();

    const handleSelect = (date: Date) => {
        onChange(date);
        setPickerIsOpen(false);
    }

    return (
        <Popover open={pickerIsOpen} onOpenChange={setPickerIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    size='lg'
                    className={cn(
                        'w-full justify-start text-left font-normal px-3',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    { value ? format(value, 'PPP') : <span>{t(placeholder)}</span> }
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white rounded-sm border-2" style={{ background: (theme === 'light' ? 'white' : '#212121') }}>
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date)=> handleSelect(date as Date)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

export default CustomDatePicker;