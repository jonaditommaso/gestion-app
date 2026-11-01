'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useState } from "react";
import UpgradeDialog from "@/components/UpgradeDialog";
import { useAppContext } from "@/context/AppContext";
import { COLOR_PRESETS } from "@/app/workspaces/constants/color-presets";
import { parseWorkspaceMetadata } from "@/app/workspaces/utils/workspace-metadata";

interface DropdownWorkspaceItem {
    $id: string;
    name?: string;
    metadata?: string | null;
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
    workspaces?: WorkspaceListData | null,
    itemBackgroundColor?: string,
    showItemName?: boolean
}

const DropdownItems = ({ itemLogo, itemName, itemType, currentWorkspaceId, workspacesCount, workspaces, itemBackgroundColor, showItemName = true }: DropdownItemsProps) => {
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
            <DropdownMenuTrigger
                aria-label={showItemName ? itemName : t('switch-workspace')}
                className="flex h-9 items-center gap-2 rounded-md border bg-background/80 p-1.5 shadow-sm backdrop-blur-md focus:outline-none"
            >
                <div
                    className="flex size-7 items-center justify-center rounded-md border border-black/5 text-base text-slate-800"
                    style={{ backgroundColor: itemBackgroundColor ?? '#e2e8f0' }}
                >
                    {itemLogo}
                </div>
                {showItemName && <p className="max-w-52 truncate text-sm font-medium">{itemName}</p>}
                {!noOptions && <ChevronsUpDown size={14} />}
            </DropdownMenuTrigger>
            {noOptions
                ? null
                : (
                <DropdownMenuContent align="start" className="min-w-60">
                    {otherWorkspaces?.map((workspace) => {
                        const metadata = parseWorkspaceMetadata(workspace.metadata);
                        const preset = COLOR_PRESETS.find(item => item.value === metadata.backgroundColor);

                        return (
                            <DropdownMenuItem
                                key={workspace.$id}
                                className="flex items-center gap-2 p-2 cursor-pointer"
                                onClick={() => handleSelectWorkspace(workspace.$id)}
                            >
                                <div
                                    className="flex size-7 items-center justify-center rounded-md border border-black/5 text-base text-slate-800"
                                    style={{ backgroundColor: preset?.iconBackground ?? '#e2e8f0' }}
                                >
                                    {metadata.workspaceIcon ?? workspace.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <span className="flex-1">{workspace.name ?? "Workspace"}</span>
                            </DropdownMenuItem>
                        );
                    })}
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