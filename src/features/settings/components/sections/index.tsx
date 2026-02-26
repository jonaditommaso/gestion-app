import React from "react";
import RemoveAccount from "./remove-account";
import Security from "./security";
import General from "./general";
import Sessions from "./sessions";

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
        id: 'security',
        title: 'security',
        description: 'Manage your security settings',
        section: <Security />,
    },
    {
        id: 'sessions',
        title: 'sessions',
        description: 'Active sessions and connected devices',
        section: <Sessions />,
    },
    {
        id: 'remove-account',
        title: 'destructive',
        description: 'Delete your account. Irreversible action.', // no parece que esto se este mostrando en algun lado.
        section: <RemoveAccount />,
        type: 'destructive',
        permission: 'demo' // modificar esta logica, porque se entiende al reves de lo que se busca
    }
]