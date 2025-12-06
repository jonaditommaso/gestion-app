import { differenceInDays } from "date-fns";

// Get color class based on due date proximity
export const getDueDateColor = (dueDate: string | Date, completed: boolean) => {
    // Normalize dates to start of day to avoid time issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(dueDate);
    endDate.setHours(0, 0, 0, 0);

    const diffInDays = differenceInDays(endDate, today);

    // Already completed - use muted
    if (completed) return 'text-muted-foreground';

    // Overdue
    if (diffInDays < 0) return 'text-destructive';

    // Due soon - same colors as TaskDate.tsx
    if (diffInDays <= 3) return 'text-red-500';
    if (diffInDays <= 7) return 'text-orange-500';
    if (diffInDays <= 14) return 'text-yellow-500';

    return 'text-muted-foreground';
};