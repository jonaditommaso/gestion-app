import { Bot, Joystick, Shield } from "lucide-react";

export const featuresDifference = [
    {
        id: 'feature-1-simple',
        title: 'products-diff-title-1',
        description: 'products-diff-description-1',
        icon: <Joystick className="h-6 w-6 text-white" />,
        color: 'bg-pink-600',
        bubbleColor: 'from-pink-500/10',
        hoverRingColor: 'hover:ring-pink-300',
        items: [
            'items-feature-diff-1-1',
            'items-feature-diff-1-2',
            'items-feature-diff-1-3'
        ]
    },
    {
        id: 'feature-2-ai',
        title: 'products-diff-title-2',
        description: 'products-diff-description-2',
        icon: <Bot className="h-6 w-6 text-white" />,
        color: 'bg-purple-600',
        bubbleColor: 'from-purple-500/10',
        hoverRingColor: 'hover:ring-purple-300',
        items: [
            'items-feature-diff-2-1',
            'items-feature-diff-2-2',
            'items-feature-diff-2-3'
        ]
    },
    {
        id: 'feature-3-security',
        title: 'products-diff-title-3',
        description: 'products-diff-description-3',
        icon: <Shield className="h-6 w-6 text-white" />,
        color: 'bg-blue-600',
        bubbleColor: 'from-blue-500/10',
        hoverRingColor: 'hover:ring-blue-300',
        items: [
            'items-feature-diff-3-1',
            'items-feature-diff-3-2',
            'items-feature-diff-3-3'
        ]
    }
];
