import React from 'react';
import { parseMarkdownHeading, renderHeading, findMarkdownSegments } from '@/utils/markdownUtils';

interface MarkdownContentProps {
    content: string;
}

/**
 * Componente para renderizar markdown básico con soporte para:
 * - Títulos (# ## ###)
 * - Negrita (**texto**)
 * - Código inline (`código`)
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let currentIndex = 0;

        lines.forEach((line, lineIndex) => {
            // Verificar si es un título de markdown
            const heading = parseMarkdownHeading(line);

            if (heading) {
                elements.push(renderHeading(heading, currentIndex++));
                return;
            }

            // Procesar cada línea para buscar negrita y código inline
            const lineElements: React.ReactNode[] = [];
            const segments = findMarkdownSegments(line);
            let lastIndex = 0;

            if (segments.length === 0) {
                lineElements.push(line);
            } else {
                segments.forEach((seg, idx) => {
                    // Texto antes del segmento
                    if (seg.start > lastIndex) {
                        lineElements.push(line.slice(lastIndex, seg.start));
                    }

                    // El segmento formateado
                    if (seg.type === 'bold') {
                        lineElements.push(
                            <strong key={`${lineIndex}-${idx}`} className="font-semibold">
                                {seg.content}
                            </strong>
                        );
                    } else if (seg.type === 'code') {
                        lineElements.push(
                            <code key={`${lineIndex}-${idx}`} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                                {seg.content}
                            </code>
                        );
                    }

                    lastIndex = seg.end;
                });

                // Texto después del último segmento
                if (lastIndex < line.length) {
                    lineElements.push(line.slice(lastIndex));
                }
            }

            elements.push(
                <span key={currentIndex++}>
                    {lineElements}
                    {lineIndex < lines.length - 1 && <br />}
                </span>
            );
        });

        return elements;
    };

    return <>{renderMarkdown(content)}</>;
};

export default MarkdownContent;
