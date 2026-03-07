import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetOrgTasksSummary = () => {
    const query = useQuery({
        queryKey: ['tasks', 'org-summary'],
        queryFn: async () => {
            const response = await client.api.tasks['org-summary'].$get();

            if (!response.ok) {
                throw new Error('Failed to fetch org tasks summary');
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
    });

    return query;
};
