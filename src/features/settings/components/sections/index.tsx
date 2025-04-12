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
}

export const settingsSections: SettingsSection[] = [
    {
        id: 'general',
        title: 'General',
        description: 'General account settings',
        section: <General />
    },
    {
        id: 'plan',
        title: 'Plan',
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
        title: 'Destructive',
        description: 'Delete your account. Irreversible action.',
        section: <RemoveAccount />,
        type: 'destructive'
    }
]