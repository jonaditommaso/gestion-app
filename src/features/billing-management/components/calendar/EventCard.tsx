import { cn } from "@/lib/utils";

interface EventCardProps {
    category: string,
    importValue: number,
    type: string
}

const typeColor = {
    income: 'text-green-500',
    expense: 'text-red-500',
}

const EventCard = ({ category, importValue, type }: EventCardProps) => {

    return (
        <div className="px-2 mb-1 bg-secondary rounded-md border">
            <p className={cn(typeColor[type as keyof typeof typeColor], 'font-semibold')}>{category}</p>
            <p className={cn(typeColor[type as keyof typeof typeColor], 'text-sm')}>${importValue}</p>
        </div>
    );
}

export default EventCard;