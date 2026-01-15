'use client'

import { usePendingChangesWarning } from '@/hooks/usePendingChangesWarning';

/**
 * Global component that handles pending changes warning.
 * Should be placed in the root layout to work across the entire app.
 */
export const PendingChangesGuard = ({ children }: { children: React.ReactNode }) => {
    // This hook adds beforeunload listener when there are pending mutations
    usePendingChangesWarning();

    return <>{children}</>;
};
