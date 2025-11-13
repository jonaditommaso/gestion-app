import { useEffect, useMemo, useRef, useState } from "react";
import { Task } from "../types";

export const useImageDescriptionLoading = (task: Task, isEditingDescription: boolean) => {
    const descriptionContainerRef = useRef<HTMLDivElement>(null);

    const descriptionHasImage = useMemo(
        () => Boolean(task.description && /<img\b/i.test(task.description)),
        [task.description]
    );
    const [imagesLoaded, setImagesLoaded] = useState(!descriptionHasImage);
    const [imagesLoadedCache, setImagesLoadedCache] = useState(!descriptionHasImage);

    useEffect(() => {
        if (!descriptionHasImage || isEditingDescription) {
            setImagesLoaded(true);
            return;
        }

        setImagesLoaded(false);

        const container = descriptionContainerRef.current;
        if (!container) return;

        const images = Array.from(container.querySelectorAll('img'));
        if (!images.length) {
            setImagesLoaded(true);
            return;
        }

        let loadedCount = 0;
        const totalImages = images.length;

        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                setImagesLoaded(true);
                setImagesLoadedCache(true);
            }
        };

        images.forEach(img => {
            if (img.complete) {
                checkAllLoaded();
            } else {
                img.addEventListener('load', checkAllLoaded, { once: true });
                img.addEventListener('error', checkAllLoaded, { once: true });
            }
        });
    }, [descriptionHasImage, isEditingDescription, task.description]);


    return {
        imagesLoaded,
        imagesLoadedCache,
        descriptionHasImage,
        descriptionContainerRef,
    }
}