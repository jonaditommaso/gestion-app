'use client'
import { Download, Eye } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface PDFPreviewProps {
    url: string,
    title: string,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const PDFPreview = ({ url, setIsOpen, title }: PDFPreviewProps) => {

    return (
        <>
            <div className='relative group border-2 border-neutral-500 rounded-sm hover:shadow-lg max-w-[131px]'>
                <div
                    onClick={() => setIsOpen(true)}
                    className="cursor-pointer transition-shadow duration-200 w-32 h-32 overflow-hidden border-b-[1px] border-black rounded"
                >
                    <iframe
                        src={url}
                        className='h-[200px] w-full pointer-events-none'
                    />

                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 rounded-sm">
                    <div className="mt-10 flex gap-2">
                        <a href={url} download={title}>
                            <Download className='cursor-pointer text-white bg-neutral-500 hover:bg-neutral-400 duration-150 transition-colors rounded-md p-2' size={32} />
                        </a>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <Eye className='cursor-pointer text-white bg-neutral-500 hover:bg-neutral-400 duration-150 transition-colors rounded-md p-2' size={32} />
                        </a>
                    </div>
                </div>
            </div>
            <span className='text-muted-foreground text-xs text-ellipsis max-w-32 overflow-hidden whitespace-nowrap inline-block'>{title}</span>
        </>

    );
}

export default PDFPreview;