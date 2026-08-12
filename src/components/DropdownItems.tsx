'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useState } from "react";
import UpgradeDialog from "@/components/UpgradeDialog";
import { useAppContext } from "@/context/AppContext";

interface DropdownWorkspaceItem {
    $id: string;
    name?: string;
}

interface WorkspaceListData {
    documents?: DropdownWorkspaceItem[];
    total?: number;
}

interface DropdownItemsProps {
    itemLogo: string,
    itemName: string,
    itemType: string,
    currentWorkspaceId?: string,
    workspacesCount: { count: number },
    workspaces?: WorkspaceListData | null
}

const DropdownItems = ({ itemLogo, itemName, itemType, currentWorkspaceId, workspacesCount, workspaces }: DropdownItemsProps) => {
    const { theme } = useTheme();
    const t = useTranslations('general');
    const router = useRouter();
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);
    const { limits } = usePlanAccess();
    const { isDemo } = useAppContext();
    const isAtWorkspaceLimit = limits.workspaces !== -1 && workspacesCount !== undefined && workspacesCount.count >= limits.workspaces;
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

    const handleSelectWorkspace = (workspaceId: string) => {
        router.push(`/workspaces/${workspaceId}`);
    }

    const handleCreateNew = () => {
        if (isAtWorkspaceLimit) {
            setUpgradeDialogOpen(true);
            return;
        }

        router.push(`/workspaces/${currentWorkspaceId}?creating=true`);
    }

    const otherWorkspaces = workspaces?.documents?.filter((ws: DropdownWorkspaceItem) => ws.$id !== currentWorkspaceId);

    const noOptions = !canWrite && otherWorkspaces?.length === 0;

    return (
        <>
            <DropdownMenu>
            <DropdownMenuTrigger className="max-w-80 flex items-center gap-2 p-2 border rounded-sm focus:outline-none h-9 bg-background">
                <div className="border border-zinc-300 w-8 h-7 rounded-md bg-zinc-200 text-white text-xl">{itemLogo}</div>
                <p className={theme === 'dark' ? 'text-white' : 'text-zinc-700'}>{itemName}</p>
                {!noOptions && <ChevronsUpDown size={14} />}
            </DropdownMenuTrigger>
            {noOptions
                ? null
                : (
                <DropdownMenuContent align="start" className="min-w-60">
                    {otherWorkspaces?.map((workspace) => (
                        <DropdownMenuItem
                            key={workspace.$id}
                            className="flex items-center gap-2 p-2 cursor-pointer"
                            onClick={() => handleSelectWorkspace(workspace.$id)}
                        >
                            <div className="border border-zinc-300 w-7 h-7 rounded-md bg-zinc-200 text-white flex items-center justify-center">
                                {workspace.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <span className="flex-1">{workspace.name ?? "Workspace"}</span>
                        </DropdownMenuItem>
                    ))}
                    {otherWorkspaces && otherWorkspaces.length > 0 && <DropdownMenuSeparator />}
                    {canWrite && (
                        <DropdownMenuItem
                            className="flex items-center gap-2 p-2 cursor-pointer"
                            onClick={handleCreateNew}
                            disabled={isDemo}
                        >
                            <Plus className="border rounded-md p-0.5" size={20} />
                            <span>{t('create-new')} {itemType}</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            )}
        </DropdownMenu>
        <UpgradeDialog
            open={upgradeDialogOpen}
            onOpenChange={setUpgradeDialogOpen}
            feature="workspaces"
            currentCount={workspacesCount?.count ?? 0}
            limitCount={limits.workspaces}
        />
        </>
    );
}

export default DropdownItems;