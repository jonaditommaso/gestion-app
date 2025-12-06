import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Locale } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface CustomToolbarProps {
    date: Date,
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void,
    locale?: Locale
}

const CustomToolbar = ({ date, onNavigate, locale }: CustomToolbarProps) => {
    return (
        <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto">
            <Button
                onClick={() => onNavigate('PREV')}
                size='icon'
                variant='secondary'
            >
                <ChevronLeftIcon className="size-4" />
            </Button>
            <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
                <CalendarIcon className="size-4 mr-2" />
                <p className="text-sm capitalize">{format(date, 'MMMM yyyy', { locale })}</p>
            </div>
            <Button
                onClick={() => onNavigate('NEXT')}
                size='icon'
                variant='secondary'
            >
                <ChevronRightIcon className="size-4" />
            </Button>
        </div>
    );
}

export default CustomToolbar;