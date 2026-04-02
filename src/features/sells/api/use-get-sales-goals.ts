import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetSalesGoals = (boardId: string | null) => {
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery({
        queryKey: ["sales-goals", boardId, isDemo],
        enabled: !isLoadingUser && !!boardId,
        queryFn: async () => {
            if (isDemo) return { total: 0, documents: [] };

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
