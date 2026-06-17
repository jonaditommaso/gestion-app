import { Bot, Calculator, KeyRound, ListTodo, LucideIcon, Palette, TrendingUp } from "lucide-react";

type Service = {
    title: string,
    description: string,
    icon: LucideIcon,
    iconColor: string,
    circleColor: string,
    circlePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right",
    shadowColor: string
}

export const services: Service[] = [
    {
        title: 'service-1',
        description: 'service-1-description',
        icon: Calculator,
        iconColor: 'text-orange-500',
        circleColor: 'bg-orange-300',
        circlePosition: "top-right",
        shadowColor: 'hover:shadow-orange-500/50'
    },
    {
        title: 'service-2',
        description: 'service-2-description',
        icon: TrendingUp,
        iconColor: 'text-green-500',
        circleColor: 'bg-green-300',
        circlePosition: "top-right",
        shadowColor: 'hover:shadow-green-500/50'
    },
    {
        title: 'service-3',
        description: 'service-3-description',
        icon: ListTodo,
        iconColor: 'text-purple-500',
        circleColor: 'bg-purple-300',
        circlePosition: "bottom-left",
        shadowColor: 'hover:shadow-purple-500/50'
    },
    {
        title: 'service-4',
        description: 'service-4-description',
        icon: Bot,
        iconColor: 'text-blue-500',
        circleColor: 'bg-blue-300',
        circlePosition: 'top-left',
        shadowColor: 'hover:shadow-blue-500/50'
    },
    {
        title: 'service-5',
        description: 'service-5-description',
        icon: KeyRound,
        iconColor: 'text-yellow-500',
        circleColor: 'bg-yellow-300',
        circlePosition: "top-right",
        shadowColor: 'hover:shadow-yellow-500/50'
    },
    {
        title: 'service-6',
        description: 'service-6-description',
        icon: Palette,
        iconColor: 'text-pink-500',
        circleColor: 'bg-pink-300',
        circlePosition: "bottom-right",
        shadowColor: 'hover:shadow-pink-500/50'
    },
]