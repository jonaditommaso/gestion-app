import { Building2, LogOut, UserCog } from "lucide-react";

type UserButtonOptionType = {
    key: string;
    text: string;
    icon: JSX.Element;
    action: 'logout' | 'my-account' | 'organization-settings';
    color: string;
    hoverColor: string;
};

export const userButtonOptions: UserButtonOptionType[]  = [
    {
        key: 'my-account',
        text: 'my-account',
        icon: <UserCog className="size-4 mr-2" />,
        action: 'my-account',
        color: '',//'text-neutral-950',
        hoverColor: ''// 'hover:!text-zinc-700'
    },
    {
        key: 'organization-settings',
        text: 'organization-settings',
        icon: <Building2 className="size-4 mr-2" />,
        action: 'organization-settings',
        color: '',
        hoverColor: ''
    },
    {
        key: 'logout',
        text: 'logout',
        icon: <LogOut className="size-4 mr-2" />,
        action: 'logout',
        color: 'text-red-600',
        hoverColor: 'hover:!text-red-400'
    }
]