import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export const useGetFiles = () => {
    const params = useParams();
    const recordId: string = params.recordId as string
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['files', recordId, isDemo],
        queryFn: async () => {
            if (isDemo) return { documents: [], total: 0 };

            const response = await client.api.records.files[':recordId'].$get({ param: { recordId } });

            if (!response.ok) {
                throw new Error('Failed to fetch files')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: true,
        enabled: !isLoadingUser && !!recordId
    })

    return query;
}