import { Palette,  Info, Settings2, UserPlus, LucideIcon } from "lucide-react"; //Download, Share2, Copy,

export interface WorkspaceOption {
    icon: LucideIcon;
    key: string;
}

export const workspaceOptions: WorkspaceOption[] = [
    {
        icon: Info,
        key: 'information'
    },
    {
        icon: UserPlus,
        key: 'add-member'
    },
    // {
    //     icon: Share2,
    //     key: 'share'
    // },
    {
        icon: Palette,
        key: 'customize'
    },
    // {
    //     icon: Copy,
    //     key: 'copy-structure'
    // },
    // {
    //     icon: Download,
    //     key: 'export'
    // },
    {
        icon: Settings2,
        key: 'general'
    }
];
