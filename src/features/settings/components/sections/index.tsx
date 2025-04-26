import React from "react";
import Plan from "./plan";
import RemoveAccount from "./remove-account";
// import Security from "./security";
import General from "./general";

type SettingsSection = {
    id: string,
    title: string,
    description: string,
    section: React.ReactNode,
    type?: 'destructive' | undefined
    permission?: 'demo' | undefined
}

export const settingsSections: SettingsSection[] = [
    {
        id: 'general',
        title: 'general',
        description: 'General account settings',
        section: <General />
    },
    {
        id: 'plan',
        title: 'plan',
        description: 'Current plan and usage',
        section: <Plan />
    },
    // {
    //     id: 'security',
    //     title: 'Security',
    //     description: 'Manage your security settings',
    //     section: <Security />,
    // },
    {
        id: 'remove-account',
        title: 'destructive',
        description: 'Delete your account. Irreversible action.', // no parece que esto se este mostrando en algun lado.
        section: <RemoveAccount />,
        type: 'destructive',
        permission: 'demo' // modificar esta logica, porque se entiende al reves de lo que se busca
    }
]