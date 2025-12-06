import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

// Portal component for draggables inside modals
// This fixes the positioning issue caused by CSS transforms on parent elements
const DraggablePortal = ({ children }: { children: React.ReactNode }) => {
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Use document.body as the portal target
        setPortalNode(document.body);
    }, []);

    if (!portalNode) return null;
    return createPortal(children, portalNode);
};

export default DraggablePortal;