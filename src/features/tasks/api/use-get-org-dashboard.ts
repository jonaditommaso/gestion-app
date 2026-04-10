import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_WORKSPACES_DATA } from "@/lib/demo-data";

export type WorkspaceHealthItem = {
    workspaceId: string;
    workspaceName: string;
    totalActive: number;
    overdueCount: number;
};

export type WorkspaceVelocityItem = {
    workspaceId: string;
    workspaceName: string;
    completedLastWeek: number;
};

type OrgDashboardData = {
    workspaceHealth: WorkspaceHealthItem[];
    workspaceVelocity: WorkspaceVelocityItem[];
};

export const useGetOrgDashboard = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery<OrgDashboardData>({
        queryKey: ['tasks', 'org-dashboard', isDemo],
        queryFn: async () => {
            if (isDemo) {
                const workspaces = DEMO_WORKSPACES_DATA.documents;
                return {
                    workspaceHealth: workspaces.map(w => ({
                        workspaceId: w.$id,
                        workspaceName: w.name,
                        totalActive: 12,
                        overdueCount: 2,
                    })),
                    workspaceVelocity: workspaces.map(w => ({
                        workspaceId: w.$id,
                        workspaceName: w.name,
                        completedLastWeek: 5,
                    })),
                };
            }

            const response = await client.api.tasks['org-dashboard'].$get();

            if (!response.ok) {
                throw new Error('Failed to fetch org dashboard');
            }

            const { data } = await response.json() as { data: OrgDashboardData };

            return data;
        },
        retry: false,
        enabled: !isLoadingUser,
    });
};
