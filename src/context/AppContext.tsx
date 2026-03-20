'use client'

import { createContext, useContext } from 'react';
import { useCurrent } from '@/features/auth/api/use-current';
import { useGetTeamContext } from '@/features/team/api/use-get-team-context';
import { HAS_SESSION_COOKIE } from '@/features/auth/constants';

type CurrentUser = NonNullable<ReturnType<typeof useCurrent>['data']>;
type TeamContextData = NonNullable<ReturnType<typeof useGetTeamContext>['data']>;

type AppContextType = {
    currentUser: CurrentUser | null | undefined;
    isLoadingUser: boolean;
    teamContext: TeamContextData | null | undefined;
    isLoadingTeamContext: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const getHasSession = () =>
    typeof document !== 'undefined' &&
    document.cookie.split(';').some(c => c.trim().startsWith(`${HAS_SESSION_COOKIE}=1`));

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const hasSession = getHasSession();
    const { data: currentUser, isLoading: isLoadingUser } = useCurrent({ enabled: hasSession });
    const { data: teamContext, isLoading: isLoadingTeamContext } = useGetTeamContext({
        enabled: !!currentUser,
    });

    return (
        <AppContext.Provider value={{ currentUser, isLoadingUser, teamContext, isLoadingTeamContext }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within AppProvider');
    return context;
};
