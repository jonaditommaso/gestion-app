import { ChevronsUp, ChevronUp, Minus, ChevronDown, ChevronsDown } from 'lucide-react'

export const TASK_PRIORITY_OPTIONS = [
    {
        value: 1,
        translationKey: 'priority-very-low',
        icon: ChevronsDown,
        color: '#6b7280',
    },
    {
        value: 2,
        translationKey: 'priority-low',
        icon: ChevronDown,
        color: '#3b82f6',
    },
    {
        value: 3,
        translationKey: 'priority-medium',
        icon: Minus,
        color: '#eab308',
    },
    {
        value: 4,
        translationKey: 'priority-high',
        icon: ChevronUp,
        color: '#f97316',
    },
    {
        value: 5,
        translationKey: 'priority-very-high',
        icon: ChevronsUp,
        color: '#ef4444',
    },
] as const
