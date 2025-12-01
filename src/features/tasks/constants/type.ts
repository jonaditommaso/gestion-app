import { CircleDotIcon, BugIcon, CheckSquareIcon, FlaskConicalIcon, FlameIcon } from "lucide-react";

export const TASK_TYPE_OPTIONS = [
    {
        value: 'epic',
        translationKey: 'epic',
        color: 'bg-purple-500',
        textColor: 'text-purple-500',
        icon: CircleDotIcon
    },
    {
        value: 'bug',
        translationKey: 'bug',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        icon: BugIcon
    },
    {
        value: 'task',
        translationKey: 'task',
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
        icon: CheckSquareIcon
    },
    {
        value: 'test',
        translationKey: 'test',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        icon: FlaskConicalIcon
    },
    {
        value: 'urgent',
        translationKey: 'urgent',
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
        icon: FlameIcon
    }
] as const;
