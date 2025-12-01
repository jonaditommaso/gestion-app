import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetSharedTaskProps {
    token: string;
}

export const useGetSharedTask = ({ token }: UseGetSharedTaskProps) => {
    const query = useQuery({
        queryKey: ['shared-task', token],
        queryFn: async () => {
            const response = await client.api.tasks.shared[':token']['$get']({
                param: { token }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error('error' in error ? error.error : 'Failed to fetch shared task');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !!token,
    });

    return query;
}
