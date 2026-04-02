'use client'
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface BillingToolbarProps {
    date: Date;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
}

const BillingToolbar = ({ date, onNavigate }: BillingToolbarProps) => {
    const dateLabel = format(date, 'MMMM yyyy');

    return (
        <div className="flex items-center gap-x-2 mb-4">
            <Button onClick={() => onNavigate('PREV')} size='icon' variant='secondary'>
                <ChevronLeftIcon className="size-4" />
            </Button>
            <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center min-w-[160px]">
                <CalendarIcon className="size-4 mr-2" />
                <p className="text-sm capitalize">{dateLabel}</p>
            </div>
            <Button onClick={() => onNavigate('NEXT')} size='icon' variant='secondary'>
                <ChevronRightIcon className="size-4" />
            </Button>
        </div>
    );
}

export default BillingToolbar;
