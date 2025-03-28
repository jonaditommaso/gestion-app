import { LogOut, Rocket, Settings } from "lucide-react";
import { redirect } from "next/navigation";

type UserButtonOptionType = {
    key: string;
    text: string;
    icon: JSX.Element;
    action: 'logout' | (() => void);
    color: string;
    hoverColor: string;
};

export const userButtonOptions: UserButtonOptionType[]  = [
    {
        key: 'plan',
        text: 'Mejora tu plan',
        icon: <Rocket className="size-4 mr-2" />,
        action: () => redirect('/pricing'),
        color: 'text-blue-600',
        hoverColor: 'hover:!text-blue-400',
    },
    {
        key: 'settings',
        text: 'Configuración',
        icon: <Settings className="size-4 mr-2" /> ,
        action: () => redirect('/settings'),
        color: '',//'text-neutral-950',
        hoverColor: ''// 'hover:!text-zinc-700'
    },
    {
        key: 'logout',
        text: 'Cerrar sesión',
        icon: <LogOut className="size-4 mr-2" />,
        action: 'logout',
        color: 'text-red-600',
        hoverColor: 'hover:!text-red-400'
    }
]