'use client'
import { useState } from "react";
import PDFPreview from "./PDFPreview";

const PDFFile = ({ url, title }: { url: string, title: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <PDFPreview
                url={url}
                setIsOpen={setIsOpen}
                title={title}
            />
        </>
    );
}

export default PDFFile;