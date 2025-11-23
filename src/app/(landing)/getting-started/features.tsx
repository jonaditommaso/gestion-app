import { BarChart3, CreditCard, FileText, FolderPlus, MessageSquare, Users } from "lucide-react";

export const features = [
    {
        id: 'team-management',
        title: 'feature-1-title',
        description: 'feature-1-description',
        color: 'blue',
        icon: <Users className="h-6 w-6 text-white" />,
        items: [
            'feature-1-item-1',
            'feature-1-item-2',
            'feature-1-item-3',
            'feature-1-item-4'
        ]
    },
    {
        id: 'workspaces',
        title: 'feature-2-title',
        description: 'feature-2-description',
        color: 'purple',
        icon: <FolderPlus className="h-6 w-6 text-white" />,
        items: [
            'feature-2-item-1',
            'feature-2-item-2',
            'feature-2-item-3',
            'feature-2-item-4'
        ]
    },
    {
        id: 'records',
        title: 'feature-3-title',
        description: 'feature-3-description',
        color: 'green',
        icon: <BarChart3 className="h-6 w-6 text-white" />,
        items: [
            'feature-3-item-1',
            'feature-3-item-2',
            'feature-3-item-3',
            'feature-3-item-4'
        ]
    },
    {
        id: 'home',
        title: 'feature-4-title',
        description: 'feature-4-description',
        color: 'orange',
        icon: <FileText className="h-6 w-6 text-white" />,
        items: [
            'feature-4-item-1',
            'feature-4-item-2',
            'feature-4-item-3',
            'feature-4-item-4'
        ]
    },
    {
        id: 'billing',
        title: 'feature-5-title',
        description: 'feature-5-description',
        color: 'red',
        icon: <CreditCard className="h-6 w-6 text-white" />,
        items: [
            'feature-5-item-1',
            'feature-5-item-2',
            'feature-5-item-3',
            'feature-5-item-4'
        ]
    },
    {
        id: 'communication',
        title: 'feature-6-title',
        description: 'feature-6-description',
        color: 'indigo',
        icon: <MessageSquare className="h-6 w-6 text-white" />,
        items: [
            'feature-6-item-1',
            'feature-6-item-2',
            'feature-6-item-3',
            'feature-6-item-4'
        ]
    }
]