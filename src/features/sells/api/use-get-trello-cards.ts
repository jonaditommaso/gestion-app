import { useQuery } from "@tanstack/react-query";

export type TrelloCard = { id: string; name: string; desc: string; due: string | null }

export const useGetTrelloCards = ({ listId }: { listId: string | null }) => {
    return useQuery<TrelloCard[], Error>({
        queryKey: ['trello-cards', listId],
        enabled: !!listId,
        queryFn: async () => {
            const res = await fetch(`/api/sells/trello/cards/${listId}`);
            if (!res.ok) throw new Error('Failed to fetch Trello cards');
            const json = await res.json() as { data: TrelloCard[] };
            return json.data;
        },
    });
};
