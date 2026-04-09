import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export const useGetRecord = () => {
    const params = useParams();
    const recordId: string = params.recordId as string
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['record', recordId, isDemo],
        queryFn: async () => {
            if (isDemo) return null;

            const response = await client.api.records[':recordId'].$get({ param: { recordId } });

            if (!response.ok) {
                throw new Error('Failed to fetch record')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser && !!recordId,
    })

    return query;
}