import { ScrollText, Users, Shield, AlertTriangle, CreditCard, ShieldCheck, UserRoundX } from "lucide-react";

export const termsData = [
    {
        id: 'welcome-to-gestionate',
        title: 'card-1-title',
        icon: <ScrollText className="w-5 h-5 text-blue-600" />,
        description1: 'card-1-description-1',
        description2: 'card-1-description-2'
    },
    {
        id: 'account-terms',
        title: 'card-2-title',
        icon: <Users className="w-5 h-5 text-green-600" />,
        items: ['card-2-list-1', 'card-2-list-2', 'card-2-list-3'],
        isList: false
    },
    {
        id: 'acceptable-use',
        title: 'card-3-title',
        icon: <Shield className="w-5 h-5 text-purple-600" />,
        description1: 'card-3-description',
        items: ['card-3-list-1', 'card-3-list-2', 'card-3-list-3', 'card-3-list-4', 'card-3-list-5', 'card-3-list-6'],
        isList: true
    },
    {
        id: 'service-availability',
        title: 'card-4-title',
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
        items: ['card-4-list-1', 'card-4-list-2', 'card-4-list-3'],
        isList: false
    },
    {
        id: 'payment-billing',
        title: 'card-5-title',
        icon: <CreditCard className="w-5 h-5 text-yellow-600" />,
        items: ['card-5-list-1', 'card-5-list-2', 'card-5-list-3'],
        isList: false
    },
    {
        id: 'privacy-data',
        title: 'card-6-title',
        icon: <ShieldCheck className="w-5 h-5 text-pink-600" />,
        items: ['card-6-list-1', 'card-6-list-2', 'card-6-list-3'],
        isList: false
    },
    {
        id: 'termination',
        title: 'card-7-title',
        icon: <UserRoundX className="w-5 h-5 text-red-600" />,
        items: ['card-7-list-1', 'card-7-list-2', 'card-7-list-3'],
        isList: false
    },
    {
        id: 'limitation-liability',
        title: 'card-8-title',
        description1: 'card-8-description'
    }
]