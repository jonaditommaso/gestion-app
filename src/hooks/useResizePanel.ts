import { useEffect } from 'react';

interface UseResizePanelProps {
    isOpen: boolean;
    isResizing: boolean;
    minWidth: number;
    setWidth: (width: number) => void;
    setIsResizing: (isResizing: boolean) => void;
}

export const useResizePanel = ({
    isOpen,
    isResizing,
    minWidth,
    setWidth,
    setIsResizing,
}: UseResizePanelProps) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            e.preventDefault();

            const newWidth = window.innerWidth - e.clientX;
            const maxWidth = window.innerWidth * 0.8; // 80% del ancho de la ventana
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
            }
        };

        if (isResizing) {
            // Prevenir selección de texto en todo el documento durante el resize
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);

            // También escuchar mouseleave para cuando el mouse sale de la ventana
            document.addEventListener("mouseleave", handleMouseUp);
        }

        return () => {
            // Restaurar estilos del body
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleMouseUp);
        };
    }, [isResizing, isOpen, minWidth, setWidth, setIsResizing]);
};
