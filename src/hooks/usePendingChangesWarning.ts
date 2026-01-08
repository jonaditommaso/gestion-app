'use client'

import { useEffect } from 'react';
import { useIsMutating } from '@tanstack/react-query';

/**
 * Hook that warns users when they try to close/refresh the page
 * while there are pending mutations (POST/PUT/PATCH/DELETE requests).
 *
 * This prevents users from accidentally losing unsaved changes.
 */
export const usePendingChangesWarning = () => {
    const pendingMutations = useIsMutating();

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (pendingMutations > 0) {
                // Standard way to show the browser's native confirmation dialog
                e.preventDefault();
                // For older browsers
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [pendingMutations]);

    return { hasPendingChanges: pendingMutations > 0, pendingCount: pendingMutations };
};
