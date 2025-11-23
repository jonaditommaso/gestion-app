'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useRouter } from "next/navigation";

interface DropdownItemsProps {
    itemLogo: string,
    itemName: string,
    itemType: string,
    currentWorkspaceId?: string,
}

const DropdownItems = ({ itemLogo, itemName, itemType, currentWorkspaceId }: DropdownItemsProps) => {
    const { theme } = useTheme();
    const t = useTranslations('general');
    const { data: workspaces } = useGetWorkspaces();
    const router = useRouter();

    const handleSelectWorkspace = (workspaceId: string) => {
        router.push(`/workspaces/${workspaceId}`);
    }

    const handleCreateNew = () => {
        router.push('/workspaces/create');
    }

    const otherWorkspaces = workspaces?.documents.filter(ws => ws.$id !== currentWorkspaceId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="max-w-80 flex items-center gap-2 p-2 border rounded-sm focus:outline-none h-9 bg-background">
                <div className="border border-zinc-300 w-8 h-7 rounded-md bg-zinc-200 text-white text-xl">{itemLogo}</div>
                <p className={theme === 'dark' ? 'text-white' : 'text-zinc-700'}>{itemName}</p>
                <ChevronsUpDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-60">
                {otherWorkspaces?.map((workspace) => (
                    <DropdownMenuItem
                        key={workspace.$id}
                        className="flex items-center gap-2 p-2 cursor-pointer"
                        onClick={() => handleSelectWorkspace(workspace.$id)}
                    >
                        <div className="border border-zinc-300 w-7 h-7 rounded-md bg-zinc-200 text-white flex items-center justify-center">
                            {workspace.name[0].toUpperCase()}
                        </div>
                        <span className="flex-1">{workspace.name}</span>
                    </DropdownMenuItem>
                ))}
                {otherWorkspaces && otherWorkspaces.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                    className="flex items-center gap-2 p-2 cursor-pointer"
                    onClick={handleCreateNew}
                >
                    <Plus className="border rounded-md p-0.5" size={20} />
                    <span>{t('create-new')} {itemType}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default DropdownItems;