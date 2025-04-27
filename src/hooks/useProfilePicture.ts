'use client'

import { useGetImageProfile } from "@/features/settings/api/use-get-image-profile";
import { useEffect, useState } from "react";

export const useProfilePicture = (id?: string | undefined) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [imageUrl, setImageUrl] = useState<any>(undefined);
    const {mutate: getImageProfile, isPending } = useGetImageProfile(id)


    useEffect(() => {
        getImageProfile(undefined, {
            onSuccess: (blob) => {
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            },
            onError: (err) => {
                console.error('No se pudo obtener la imagen:', err);
            }
        })
    }, []);

    return { imageUrl, isPending }
}