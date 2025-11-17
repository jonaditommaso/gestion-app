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
        gradient: 'bg-gradient-to-br from-sky-400/40 via-blue-500/30 to-slate-900/20 dark:from-sky-500/30 dark:via-blue-600/25 dark:to-slate-950/40'
    },
    {
        name: 'Forest',
        value: '#10b981',
        gradient: 'bg-gradient-to-br from-emerald-400/40 via-green-500/30 to-slate-900/20 dark:from-emerald-500/30 dark:via-green-600/25 dark:to-slate-950/40'
    },
    {
        name: 'Sunset',
        value: '#f97316',
        gradient: 'bg-gradient-to-br from-orange-400/40 via-red-500/30 to-slate-900/20 dark:from-orange-500/30 dark:via-red-600/25 dark:to-slate-950/40'
    },
    {
        name: 'Lavender',
        value: '#a855f7',
        gradient: 'bg-gradient-to-br from-purple-400/40 via-violet-500/30 to-slate-900/20 dark:from-purple-500/30 dark:via-violet-600/25 dark:to-slate-950/40'
    },
    {
        name: 'Rose',
        value: '#e11d48',
        gradient: 'bg-gradient-to-br from-rose-400/40 via-pink-500/30 to-slate-900/20 dark:from-rose-500/30 dark:via-pink-600/25 dark:to-slate-950/40'
    },
    {
        name: 'Amber',
        value: '#f59e0b',
        gradient: 'bg-gradient-to-br from-amber-400/40 via-yellow-500/30 to-slate-900/20 dark:from-amber-500/30 dark:via-yellow-600/25 dark:to-slate-950/40'
    },
    {
        name: 'Slate',
        value: '#64748b',
        gradient: 'bg-gradient-to-br from-slate-400/40 via-gray-500/30 to-slate-900/20 dark:from-slate-500/30 dark:via-gray-600/25 dark:to-slate-950/40'
    },
];
