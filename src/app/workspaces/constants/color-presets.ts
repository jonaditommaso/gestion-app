export interface ColorPreset {
    name: string;
    value: string;
    gradient: string;
    iconBackground: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
    {
        name: 'theme-default',
        value: 'transparent',
        gradient: 'bg-gradient-to-r from-slate-100 via-stone-100 to-slate-200 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800',
        iconBackground: '#e2e8f0',
    },
    {
        name: 'theme-ocean',
        value: '#0ea5e9',
        gradient: 'bg-gradient-to-r from-slate-100 via-sky-100 to-blue-200 dark:from-slate-900 dark:via-sky-950/70 dark:to-blue-950',
        iconBackground: '#dbeafe',
    },
    {
        name: 'theme-forest',
        value: '#10b981',
        gradient: 'bg-gradient-to-r from-stone-100 via-emerald-100 to-teal-200 dark:from-slate-900 dark:via-emerald-950/70 dark:to-teal-950',
        iconBackground: '#d1fae5',
    },
    {
        name: 'theme-sunset',
        value: '#f97316',
        gradient: 'bg-gradient-to-r from-stone-100 via-orange-100 to-amber-200 dark:from-slate-900 dark:via-orange-950/70 dark:to-amber-950',
        iconBackground: '#ffedd5',
    },
    {
        name: 'theme-lavender',
        value: '#a855f7',
        gradient: 'bg-gradient-to-r from-slate-100 via-violet-100 to-indigo-200 dark:from-slate-900 dark:via-violet-950/70 dark:to-indigo-950',
        iconBackground: '#ede9fe',
    },
    {
        name: 'theme-rose',
        value: '#e11d48',
        gradient: 'bg-gradient-to-r from-stone-100 via-rose-100 to-pink-200 dark:from-slate-900 dark:via-rose-950/70 dark:to-pink-950',
        iconBackground: '#ffe4e6',
    },
    {
        name: 'theme-amber',
        value: '#f59e0b',
        gradient: 'bg-gradient-to-r from-stone-100 via-amber-100 to-yellow-200 dark:from-slate-900 dark:via-amber-950/70 dark:to-yellow-950',
        iconBackground: '#fef3c7',
    },
    {
        name: 'theme-slate',
        value: '#64748b',
        gradient: 'bg-gradient-to-r from-slate-100 via-slate-200 to-zinc-300 dark:from-slate-900 dark:via-slate-800 dark:to-zinc-800',
        iconBackground: '#e2e8f0',
    },
    {
        name: 'theme-red',
        value: '#dc2626',
        gradient: 'bg-gradient-to-r from-stone-100 via-red-100 to-orange-200 dark:from-slate-900 dark:via-red-950/70 dark:to-orange-950',
        iconBackground: '#fee2e2',
    },
    {
        name: 'theme-blue',
        value: '#2563eb',
        gradient: 'bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-200 dark:from-slate-900 dark:via-blue-950/70 dark:to-indigo-950',
        iconBackground: '#dbeafe',
    },
    {
        name: 'theme-teal',
        value: '#14b8a6',
        gradient: 'bg-gradient-to-r from-stone-100 via-teal-100 to-cyan-200 dark:from-slate-900 dark:via-teal-950/70 dark:to-cyan-950',
        iconBackground: '#ccfbf1',
    },
    {
        name: 'theme-indigo',
        value: '#6366f1',
        gradient: 'bg-gradient-to-r from-slate-100 via-indigo-100 to-blue-200 dark:from-slate-900 dark:via-indigo-950/70 dark:to-blue-950',
        iconBackground: '#e0e7ff',
    },
];

export const WORKSPACE_ICON_PRESETS = [
    // '📁',
    // '🚀',
    '🎯',
    '💡',
    '🧩',
    '🛠️',
    // '📣',
    '📊',
    // '✨',
    '🌱',
    // '💼',
    // '🎬',
];
