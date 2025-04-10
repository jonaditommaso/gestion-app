import { ArrowRightLeft, Calculator, KeyRound, ListTodo, LucideIcon, Palette, UserRoundSearch } from "lucide-react";

type Service = {
    title: string,
    description: string,
    icon: LucideIcon,
    iconColor: string,
    circleColor: string,
    circlePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export const services: Service[] = [
    {
        title: 'service-1',
        description: 'service-1-description',
        icon: Calculator,
        iconColor: 'text-orange-500',
        circleColor: 'bg-orange-300',
        circlePosition: "top-right"
    },
    {
        title: 'service-2',
        description: 'service-2-description',
        icon: ArrowRightLeft,
        iconColor: 'text-green-500',
        circleColor: 'bg-green-300',
        circlePosition: "top-right"
    },
    {
        title: 'service-3',
        description: 'service-3-description',
        icon: ListTodo,
        iconColor: 'text-purple-500',
        circleColor: 'bg-purple-300',
        circlePosition: "bottom-left"
    },
    {
        title: 'service-4',
        description: 'service-4-description',
        icon: UserRoundSearch,
        iconColor: 'text-blue-500',
        circleColor: 'bg-blue-300',
        circlePosition: 'top-left'
    },
    {
        title: 'service-5',
        description: 'service-5-description',
        icon: KeyRound,
        iconColor: 'text-yellow-500',
        circleColor: 'bg-yellow-300',
        circlePosition: "top-right"
    },
    {
        title: 'service-6',
        description: 'service-6-description',
        icon: Palette,
        iconColor: 'text-pink-500',
        circleColor: 'bg-pink-300',
        circlePosition: "bottom-right"
    },
]