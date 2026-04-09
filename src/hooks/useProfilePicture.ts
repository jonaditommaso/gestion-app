'use client'

import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";

export const useProfilePicture = (id?: string | undefined, hasImage: boolean = true) => {
    const { isDemo } = useAppContext();

    const { data: imageUrl, isPending } = useQuery({
        queryKey: ['image-profile', id],
        queryFn: async () => {
            const response = await fetch(`/api/settings/get-image${id ? `/${id}` : ''}`);

            if (!response.ok) {
                return null;
            }

            const contentType = response.headers.get('Content-Type') || 'image/jpeg';
            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: contentType });
            return URL.createObjectURL(blob);
        },
        retry: false,
        staleTime: 0, // Siempre refetch cuando se invalida
        enabled: hasImage && !isDemo
    });

    return { imageUrl: imageUrl ?? undefined, isPending: hasImage ? isPending : false }
}