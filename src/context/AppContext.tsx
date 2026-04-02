'use client'

import { createContext, useContext } from 'react';
import { useCurrent } from '@/features/auth/api/use-current';
import { useGetTeamContext } from '@/features/team/api/use-get-team-context';
import { DEMO_ORG, DEMO_MEMBERSHIP } from '@/lib/demo-data';

type CurrentUser = NonNullable<ReturnType<typeof useCurrent>['data']>;
type TeamContextData = NonNullable<ReturnType<typeof useGetTeamContext>['data']>;

type AppContextType = {
    currentUser: CurrentUser | null | undefined;
    isLoadingUser: boolean;
    teamContext: TeamContextData | null | undefined;
    isLoadingTeamContext: boolean;
    isDemo: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children, hasSession }: { children: React.ReactNode; hasSession: boolean }) => {
    const { data: currentUser, isLoading: isLoadingUser } = useCurrent({ enabled: hasSession });
    const isDemo = currentUser?.prefs?.isDemo === true;

    const { data: teamContext, isLoading: isLoadingTeamContext } = useGetTeamContext({
        enabled: !isDemo && !!currentUser,
    });

    const effectiveTeamContext: TeamContextData | null | undefined = isDemo && currentUser
        ? {
            membership: { ...DEMO_MEMBERSHIP, userId: currentUser.$id },
            org: DEMO_ORG,
            allContexts: [{ membership: { ...DEMO_MEMBERSHIP, userId: currentUser.$id }, org: DEMO_ORG }],
        }
        : teamContext;

    return (
        <AppContext.Provider value={{ currentUser, isLoadingUser, teamContext: effectiveTeamContext, isLoadingTeamContext: isDemo ? false : isLoadingTeamContext, isDemo }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within AppProvider');
    return context;
};
