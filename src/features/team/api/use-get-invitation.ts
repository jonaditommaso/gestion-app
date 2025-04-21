import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetInvitation = (token: string) => {
    const query = useQuery({
        queryKey: ['invitation', token],
        queryFn: async () => {
            const response = await client.api.team['join-team'][':token'].$get({ param: { token } });

            if(!response.ok) {
                throw new Error('Failed to fetch members')
            }

            const { data } = await response.json();

            return data;
        }
    })

    return query;
}