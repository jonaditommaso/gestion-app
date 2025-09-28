import { Github, User, Play, CreditCard, Building, Rocket, UserPlus, Settings, Users, FolderPlus, BarChart3, FileText } from "lucide-react";

export const steps = [
    {
        stepNumber: 1,
        id: 'choose-plan',
        title: 'step-1-title',
        description: 'step-1-description',
        mainColor: 'purple',
        items: [
            {
                id: 'basic',
                icon: <CreditCard className="h-4 w-4 text-blue-600" />,
                iconColor: 'bg-blue-100',
                text: 'step-1-item-1',
            },
            {
                id: 'pro',
                icon: <Building className="h-4 w-4 text-purple-600" />,
                iconColor: 'bg-purple-100',
                text: 'step-1-item-2',
            },
            {
                id: 'enterprise',
                icon: <Rocket className="h-4 w-4 text-orange-600" />,
                iconColor: 'bg-orange-100',
                text: 'step-1-item-3',
            }
        ]
    },
    {
        stepNumber: 2,
        id: 'create-account',
        title: 'step-2-title',
        description: 'step-2-description',
        mainColor: 'blue',
        items: [
            {
                id: 'github',
                icon: <Github className="h-4 w-4 text-gray-600" />,
                iconColor: 'bg-gray-100',
                text: 'step-2-item-1',
            },
            {
                id: 'google',
                icon: <User className="h-4 w-4 text-red-600" />,
                iconColor: 'bg-red-100',
                text: 'step-2-item-2',
            },
            {
                id: 'demo',
                icon: <Play className="h-4 w-4 text-green-600" />,
                iconColor: 'bg-green-100',
                text: 'step-2-item-3',
            }
        ]
    },
    {
        stepNumber: 3,
        id: 'configure-team',
        title: 'step-3-title',
        description: 'step-3-description',
        mainColor: 'green',
        items: [
            {
                id: 'invitations',
                icon: <UserPlus className="h-4 w-4 text-blue-600" />,
                iconColor: 'bg-blue-100',
                text: 'step-3-item-1',
            },
            {
                id: 'roles-permissions',
                icon: <Settings className="h-4 w-4 text-purple-600" />,
                iconColor: 'bg-purple-100',
                text: 'step-3-item-2',
            },
            {
                id: 'organization',
                icon: <Users className="h-4 w-4 text-green-600" />,
                iconColor: 'bg-green-100',
                text: 'step-3-item-3',
            }
        ]
    },
    {
        stepNumber: 4,
        id: 'create-account',
        title: 'step-4-title',
        description: 'step-4-description',
        mainColor: 'orange',
        items: [
            {
                id: 'github',
                icon: <FolderPlus className="h-4 w-4 text-blue-600" />,
                iconColor: 'bg-blue-100',
                text: 'step-4-item-1',
            },
            {
                id: 'google',
                icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
                iconColor: 'bg-purple-100',
                text: 'step-4-item-2',
            },
            {
                id: 'demo',
                icon: <FileText className="h-4 w-4 text-green-600" />,
                iconColor: 'bg-green-100',
                text: 'step-4-item-3',
            }
        ]
    }
]