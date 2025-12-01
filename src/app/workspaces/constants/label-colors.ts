/**
 * Available colors for custom labels
 * Inspired by Trello/Jira label colors
 */
export const LABEL_COLORS = [
    { name: 'Green', value: '#4ade80', textColor: '#166534' },
    { name: 'Yellow', value: '#facc15', textColor: '#854d0e' },
    { name: 'Orange', value: '#fb923c', textColor: '#9a3412' },
    { name: 'Red', value: '#f87171', textColor: '#991b1b' },
    { name: 'Purple', value: '#c084fc', textColor: '#6b21a8' },
    { name: 'Blue', value: '#60a5fa', textColor: '#1e40af' },
    { name: 'Sky', value: '#38bdf8', textColor: '#0369a1' },
    { name: 'Teal', value: '#2dd4bf', textColor: '#115e59' },
    { name: 'Pink', value: '#f472b6', textColor: '#9d174d' },
    { name: 'Gray', value: '#9ca3af', textColor: '#374151' },
] as const;

export type LabelColor = typeof LABEL_COLORS[number];

/**
 * Maximum number of custom labels per workspace
 */
export const MAX_CUSTOM_LABELS = 10;

/**
 * Maximum length for label name
 */
export const MAX_LABEL_NAME_LENGTH = 20;
