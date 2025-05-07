import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useParams } from "next/navigation";

export const useGetRecord = () => {
    const params = useParams();
    const recordId: string = params.recordId as string

    const query = useQuery({
        queryKey: ['record', recordId],
        queryFn: async () => {
            const response = await client.api.records[':recordId'].$get({ param: { recordId } });

            if (!response.ok) {
                throw new Error('Failed to fetch record')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !!recordId,
    })

    return query;
}