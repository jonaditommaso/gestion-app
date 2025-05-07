import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetRecords = ({ tableId }: { tableId: string }) => {
    const query = useQuery({
        queryKey: ['records'],
        queryFn: async () => {
            const response = await client.api.records[':tableId'].$get({ param: { tableId } });

            if (!response.ok) {
                throw new Error('Failed to fetch records')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: true,
        enabled: !!tableId
    })

    return query;
}