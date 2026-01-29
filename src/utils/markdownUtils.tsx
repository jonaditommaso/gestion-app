import React from 'react';

export interface HeadingMatch {
    level: 1 | 2 | 3;
    content: string;
    className: string;
}

/**
 * Verifica si una línea es un título de markdown y retorna la información necesaria
 */
export const parseMarkdownHeading = (line: string): HeadingMatch | null => {
    const h3Match = line.match(/^###\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h1Match = line.match(/^#\s+(.+)$/);

    if (h3Match) {
        return {
            level: 3,
            content: h3Match[1],
            className: "text-base font-semibold mt-4 mb-2"
        };
    }

    if (h2Match) {
        return {
            level: 2,
            content: h2Match[1],
            className: "text-lg font-semibold mt-4 mb-2"
        };
    }

    if (h1Match) {
        return {
            level: 1,
            content: h1Match[1],
            className: "text-xl font-bold mt-4 mb-2"
        };
    }

    return null;
};

/**
 * Renderiza un título de markdown según su nivel
 */
export const renderHeading = (heading: HeadingMatch, key: string | number): React.ReactNode => {
    const props = {
        key,
        className: heading.className,
        children: heading.content
    };

    switch (heading.level) {
        case 1:
            return <h1 {...props} />;
        case 2:
            return <h2 {...props} />;
        case 3:
            return <h3 {...props} />;
    }
};

export interface MarkdownSegment {
    start: number;
    end: number;
    type: 'bold' | 'code';
    content: string;
}

/**
 * Encuentra todos los segmentos de markdown en una línea (negrita y código inline)
 */
export const findMarkdownSegments = (line: string): MarkdownSegment[] => {
    const segments: MarkdownSegment[] = [];

    // Regex para encontrar **texto** (negrita) y `código`
    const boldRegex = /\*\*(.+?)\*\*/g;
    const codeRegex = /`([^`]+)`/g;

    let match;

    // Buscar negritas
    while ((match = boldRegex.exec(line)) !== null) {
        segments.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'bold',
            content: match[1]
        });
    }

    // Buscar código inline
    while ((match = codeRegex.exec(line)) !== null) {
        const overlaps = segments.some(s =>
            (match!.index >= s.start && match!.index < s.end) ||
            (match!.index + match![0].length > s.start && match!.index + match![0].length <= s.end)
        );
        if (!overlaps) {
            segments.push({
                start: match.index,
                end: match.index + match[0].length,
                type: 'code',
                content: match[1]
            });
        }
    }

    // Ordenar por posición
    segments.sort((a, b) => a.start - b.start);

    return segments;
};
