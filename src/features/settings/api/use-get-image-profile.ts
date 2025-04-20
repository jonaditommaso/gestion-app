import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetImageProfile = (id: string | undefined) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<Blob, Error, void>({
        mutationFn: async () => {
            const response = await fetch(`/api/settings/get-image${id ? `/${id}` : ''}`);

            if(!response.ok) {
                throw new Error('Failed getting image')
            }

            const contentType = response.headers.get('Content-Type') || 'image/jpeg';
            const arrayBuffer = await response.arrayBuffer();
            return new Blob([arrayBuffer], { type: contentType });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['image-profile'] })
        },
    })
    return mutation
}