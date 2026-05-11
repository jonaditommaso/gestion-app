import { useQuery } from "@tanstack/react-query";

export type TrelloBoard = { id: string; name: string }

export const useGetTrelloBoards = ({ enabled }: { enabled: boolean }) => {
    return useQuery<TrelloBoard[], Error>({
        queryKey: ['trello-boards'],
        enabled,
        queryFn: async () => {
            const res = await fetch('/api/sells/trello/boards');
            if (!res.ok) throw new Error('Failed to fetch Trello boards');
            const json = await res.json() as { data: TrelloBoard[] };
            return json.data;
        },
    });
};
