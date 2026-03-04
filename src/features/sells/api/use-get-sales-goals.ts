import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetSalesGoals = (boardId: string | null) => {
    return useQuery({
        queryKey: ["sales-goals", boardId],
        enabled: !!boardId,
        queryFn: async () => {
            const response = await client.api.sells.boards[":boardId"]["goals"].$get({
                param: { boardId: boardId! },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch sales goals");
            }

            const { data } = await response.json();
            return data;
        },
        retry: false,
        refetchOnMount: true,
    });
};
