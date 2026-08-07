'use client'

import { createContext, useContext } from 'react';
// import { useCurrent } from '@/features/auth/api/use-current';
import { useGetTeamContext } from '@/features/team/api/use-get-team-context';
import { DEMO_ORG, DEMO_MEMBERSHIP } from '@/lib/demo-data';
import { Models } from 'node-appwrite';

// type CurrentUser = NonNullable<ReturnType<typeof useCurrent>['data']>;
type CurrentUser = {
    authProviders: string[];
    isOAuth: boolean;
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    password?: string | undefined;
    hash?: string | undefined;
    hashOptions?: object | undefined;
    registration: string;
    status: boolean;
    labels: string[];
    passwordUpdate: string;
    email: string;
    phone: string;
    emailVerification: boolean;
    phoneVerification: boolean;
    mfa: boolean;
    prefs: Models.Preferences;
    targets: Models.Target[];
    accessedAt: string;
} | null

type TeamContextData = NonNullable<ReturnType<typeof useGetTeamContext>['data']>;


type AppContextType = {
    currentUser: CurrentUser | null | undefined;
    // isLoadingUser: boolean;
    teamContext: TeamContextData | null | undefined;
    isLoadingTeamContext: boolean;
    isDemo: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children, isDemo, currentUser }: { children: React.ReactNode; isDemo: boolean; currentUser: CurrentUser | null | undefined }) => {
    // const { data: currentUser, isLoading: isLoadingUser } = useCurrent({ enabled: hasSession });

    const { data: teamContext, isLoading: isLoadingTeamContext } = useGetTeamContext({
        enabled: !isDemo && !!currentUser,
    });

    const demoTeamContext: TeamContextData = {
        membership: DEMO_MEMBERSHIP,
        org: DEMO_ORG,
        allContexts: [{ membership: DEMO_MEMBERSHIP, org: DEMO_ORG }],
    };

    const effectiveTeamContext: TeamContextData | null | undefined = isDemo
        ? demoTeamContext
        : teamContext;

    return (
        <AppContext.Provider value={{ currentUser, teamContext: effectiveTeamContext, isLoadingTeamContext: isDemo ? false : isLoadingTeamContext, isDemo }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within AppProvider');
    return context;
};
