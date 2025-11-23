import { useMemo } from 'react';
import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';
import { DEFAULT_WORKSPACE_CONFIG } from '../constants/workspace-config-keys';
import { useWorkspaceId } from './use-workspace-id';

/**
 * Hook to get the parsed workspace configuration
 * Merges workspace metadata with default config values
 * @returns Workspace configuration object with all settings
 */
export const useWorkspaceConfig = () => {
    const workspaceId = useWorkspaceId();
    const { data: workspaces } = useGetWorkspaces();

    const config = useMemo(() => {
        try {
            const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);

            if (currentWorkspace?.metadata) {
                const metadata = typeof currentWorkspace.metadata === 'string'
                    ? JSON.parse(currentWorkspace.metadata)
                    : currentWorkspace.metadata;
                return { ...DEFAULT_WORKSPACE_CONFIG, ...metadata };
            }
        } catch (error) {
            console.error('Error parsing workspace metadata:', error);
        }
        return DEFAULT_WORKSPACE_CONFIG;
    }, [workspaces, workspaceId]);

    return config;
};
