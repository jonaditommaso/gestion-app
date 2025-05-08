import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useParams } from "next/navigation";

export const useGetFiles = () => {
    const params = useParams();
    const recordId: string = params.recordId as string

    const query = useQuery({
        queryKey: ['files'],
        queryFn: async () => {
            const response = await client.api.records.files[':recordId'].$get({ param: { recordId } });

            if (!response.ok) {
                throw new Error('Failed to fetch files')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: true,
        enabled: !!recordId
    })

    return query;
}