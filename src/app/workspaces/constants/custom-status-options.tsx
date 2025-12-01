import {
    CircleIcon,
    CircleDashedIcon,
    CircleDotIcon,
    CircleDotDashed,
    CircleCheckIcon,
    CircleAlert,
    CircleHelp,
    CircleX,
    CircleDollarSign,
    Star,
    CircleFadingArrowUp,
    Crown
} from "lucide-react";

/**
 * Available icon options for custom status columns
 */
export const CUSTOM_STATUS_ICON_OPTIONS = [
    { value: 'circle', label: 'Circle', icon: CircleIcon },
    { value: 'circle-dashed', label: 'Circle Dashed', icon: CircleDashedIcon },
    { value: 'circle-dot', label: 'Circle Dot', icon: CircleDotIcon },
    { value: 'circle-dot-dashed', label: 'Circle Dot Dashed', icon: CircleDotDashed },
    { value: 'circle-check', label: 'Circle Check', icon: CircleCheckIcon },
    { value: 'circle-fading-arrow-up', label: 'Circle Fading Arrow Up', icon: CircleFadingArrowUp },
    { value: 'circle-alert', label: 'Circle Alert', icon: CircleAlert },
    { value: 'circle-help', label: 'Circle Help', icon: CircleHelp },
    { value: 'circle-x', label: 'Circle X', icon: CircleX },
    { value: 'circle-dollar-sign', label: 'Circle Dollar', icon: CircleDollarSign },
    { value: 'star', label: 'Star', icon: Star },
    { value: 'crown', label: 'Crown', icon: Crown },
] as const;

/**
 * Available color options for custom status columns
 */
export const CUSTOM_STATUS_COLOR_OPTIONS = [
    { value: '#ef4444', label: 'Red', name: 'red' },
    { value: '#f97316', label: 'Orange', name: 'orange' },
    { value: '#f59e0b', label: 'Amber', name: 'amber' },
    { value: '#eab308', label: 'Yellow', name: 'yellow' },
    { value: '#84cc16', label: 'Lime', name: 'lime' },
    { value: '#10b981', label: 'Green', name: 'green' },
    { value: '#14b8a6', label: 'Teal', name: 'teal' },
    { value: '#06b6d4', label: 'Cyan', name: 'cyan' },
    { value: '#3b82f6', label: 'Blue', name: 'blue' },
    { value: '#6366f1', label: 'Indigo', name: 'indigo' },
    { value: '#8b5cf6', label: 'Purple', name: 'purple' },
    { value: '#a855f7', label: 'Violet', name: 'violet' },
    { value: '#d946ef', label: 'Fuchsia', name: 'fuchsia' },
    { value: '#ec4899', label: 'Pink', name: 'pink' },
    { value: '#f43f5e', label: 'Rose', name: 'rose' },
    { value: '#64748b', label: 'Slate', name: 'slate' },
    { value: '#6b7280', label: 'Gray', name: 'gray' },
];

/**
 * Type for icon option values
 */
export type CustomStatusIconValue = typeof CUSTOM_STATUS_ICON_OPTIONS[number]['value'];

/**
 * Type for color option values
 */
export type CustomStatusColorValue = typeof CUSTOM_STATUS_COLOR_OPTIONS[number]['value'];
