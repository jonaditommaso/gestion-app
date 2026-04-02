import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_RECORDS_BY_TABLE } from "@/lib/demo-data";

export const useGetRecords = ({ tableId }: { tableId: string }) => {
    const { isDemo } = useAppContext();

    const query = useQuery({
        queryKey: ['records', tableId],
        queryFn: async () => {
            if (isDemo) {
                return DEMO_RECORDS_BY_TABLE[tableId] ?? { total: 0, documents: [] };
            }

            const response = await client.api.records['record-headers'][':tableId'].$get({ param: { tableId } });

            if (!response.ok) {
                throw new Error('Failed to fetch records')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: true,
        enabled: isDemo || !!tableId
    })

    return query;
}