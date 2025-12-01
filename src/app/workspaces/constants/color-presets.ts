export interface ColorPreset {
    name: string;
    value: string;
    gradient: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
    {
        name: 'Default',
        value: 'transparent',
        gradient: 'bg-background'
    },
    {
        name: 'Ocean',
        value: '#0ea5e9',
        gradient: 'bg-gradient-to-br from-sky-300/60 via-blue-400/50 to-slate-800/30 dark:from-sky-400/50 dark:via-blue-500/40 dark:to-slate-950/50'
    },
    {
        name: 'Forest',
        value: '#10b981',
        gradient: 'bg-gradient-to-br from-emerald-300/60 via-green-400/50 to-slate-800/30 dark:from-emerald-400/50 dark:via-green-500/40 dark:to-slate-950/50'
    },
    {
        name: 'Sunset',
        value: '#f97316',
        gradient: 'bg-gradient-to-br from-orange-300/70 via-orange-500/60 to-slate-800/30 dark:from-orange-400/60 dark:via-orange-600/50 dark:to-slate-950/50'
    },
    {
        name: 'Lavender',
        value: '#a855f7',
        gradient: 'bg-gradient-to-br from-purple-300/60 via-purple-400/50 to-slate-800/30 dark:from-purple-400/50 dark:via-purple-500/40 dark:to-slate-950/50'
    },
    {
        name: 'Rose',
        value: '#e11d48',
        gradient: 'bg-gradient-to-br from-pink-300/70 via-pink-500/60 to-slate-800/30 dark:from-pink-400/60 dark:via-pink-600/50 dark:to-slate-950/50'
    },
    {
        name: 'Amber',
        value: '#f59e0b',
        gradient: 'bg-gradient-to-br from-amber-300/70 via-yellow-400/60 to-slate-800/30 dark:from-amber-400/60 dark:via-yellow-500/50 dark:to-slate-950/50'
    },
    {
        name: 'Slate',
        value: '#64748b',
        gradient: 'bg-gradient-to-br from-slate-300/60 via-gray-400/50 to-slate-800/30 dark:from-slate-400/50 dark:via-gray-500/40 dark:to-slate-950/50'
    },
    {
        name: 'Red',
        value: '#dc2626',
        gradient: 'bg-gradient-to-br from-red-400/70 via-red-600/60 to-slate-800/30 dark:from-red-500/60 dark:via-red-700/50 dark:to-slate-950/50'
    },
    {
        name: 'Blue',
        value: '#2563eb',
        gradient: 'bg-gradient-to-br from-blue-300/70 via-blue-600/60 to-slate-800/30 dark:from-blue-400/60 dark:via-blue-700/50 dark:to-slate-950/50'
    },
    {
        name: 'Teal',
        value: '#14b8a6',
        gradient: 'bg-gradient-to-br from-teal-300/70 via-teal-500/60 to-slate-800/30 dark:from-teal-400/60 dark:via-teal-600/50 dark:to-slate-950/50'
    },
    {
        name: 'Indigo',
        value: '#6366f1',
        gradient: 'bg-gradient-to-br from-indigo-300/70 via-indigo-500/60 to-slate-800/30 dark:from-indigo-400/60 dark:via-indigo-600/50 dark:to-slate-950/50'
    },
];
