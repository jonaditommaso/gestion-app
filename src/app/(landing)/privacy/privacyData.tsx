import { Bell, Database, Eye, Globe, Lock, UserCheck } from "lucide-react";

export const privacyData = [
    {
        id: 'information-we-collect',
        title: 'card-2-title',
        icon: <Database className="w-5 h-5 text-green-600" />,
        description1: 'card-2-description',
        subtitle1: 'card-2-subtitle-1',
        subtitle2: 'card-2-subtitle-2',
        items1: ['card-2-list-1-1', 'card-2-list-1-2', 'card-2-list-1-3', 'card-2-list-1-4', 'card-2-list-1-5'],
        items2: ['card-2-list-2-1', 'card-2-list-2-2', 'card-2-list-2-3', 'card-2-list-2-4'],
        hasSubtitles: true
    },
    {
        id: 'how-we-use-your-information',
        title: 'card-3-title',
        icon: <Eye className="w-5 h-5 text-purple-600" />,
        description1: 'card-3-description',
        items: ['card-3-list-1', 'card-3-list-2', 'card-3-list-3', 'card-3-list-4', 'card-3-list-5', 'card-3-list-6', 'card-3-list-7', 'card-3-list-8']
    },
    {
        id: 'information-sharing',
        title: 'card-4-title',
        icon: <Globe className="w-5 h-5 text-orange-600" />,
        description1: 'card-4-description',
        items: ['card-4-list-1', 'card-4-list-2', 'card-4-list-3', 'card-4-list-4', 'card-4-list-5'],
    },
    {
        id: 'data-security',
        title: 'card-5-title',
        icon: <Lock className="w-5 h-5 text-red-600" />,
        description1: 'card-5-description',
        subtitle1: 'card-5-subtitle-1',
        items: ['card-5-list-1', 'card-5-list-2', 'card-5-list-3', 'card-5-list-4', 'card-5-list-5'],
        hasSubtitle: true
    },
    {
        id: 'privacy-rights',
        title: 'card-6-title',
        icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
        description1: 'card-6-description',
        items: ['card-6-list-1', 'card-6-list-2', 'card-6-list-3', 'card-6-list-4', 'card-6-list-5', 'card-6-list-6', 'card-6-list-7'],
    },
    {
        id: 'cookies-and-tracking',
        title: 'card-7-title',
        icon: <Bell className="w-5 h-5 text-yellow-600" />,
        description1: 'card-7-description',
        subtitle1: 'card-7-subtitle-1',
        items: ['card-7-list-1', 'card-7-list-2', 'card-7-list-3', 'card-7-list-4'],
        hasSubtitle: true
    }
]