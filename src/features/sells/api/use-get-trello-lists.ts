import { useQuery } from "@tanstack/react-query";

export type TrelloList = { id: string; name: string }

export const useGetTrelloLists = ({ boardId }: { boardId: string | null }) => {
    return useQuery<TrelloList[], Error>({
        queryKey: ['trello-lists', boardId],
        enabled: !!boardId,
        queryFn: async () => {
            const res = await fetch(`/api/sells/trello/lists/${boardId}`);
            if (!res.ok) throw new Error('Failed to fetch Trello lists');
            const json = await res.json() as { data: TrelloList[] };
            return json.data;
        },
    });
};
