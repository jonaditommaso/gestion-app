import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

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
    return useQuery<OrgDashboardData>({
        queryKey: ['tasks', 'org-dashboard'],
        queryFn: async () => {
            const response = await client.api.tasks['org-dashboard'].$get();

            if (!response.ok) {
                throw new Error('Failed to fetch org dashboard');
            }

            const { data } = await response.json() as { data: OrgDashboardData };

            return data;
        },
        retry: false,
    });
};
