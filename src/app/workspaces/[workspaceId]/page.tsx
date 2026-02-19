'use client'
import CreateWorkspaceForm from "@/features/workspaces/components/CreateWorkspaceForm";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Settings2 } from "lucide-react";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import WorkspaceSettings from "@/features/workspaces/components/WorkspaceSettings";
import DropdownItems from "@/components/DropdownItems";
import TaskSwitcher from "@/features/tasks/components/TaskSwitcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { workspaceOptions } from "@/features/workspaces/constants/workspace-options";
import { useTranslations } from "next-intl";
import AddWorkspaceMembersModal from "./AddWorkspaceMembersModal";
import WorkspaceInfoModal from "./WorkspaceInfoModal";
import { WorkspaceType } from "@/features/workspaces/types";
import WorkspaceCustomize from "./WorkspaceCustomize";
import { useWorkspacePermissions } from "../hooks/use-workspace-permissions";

const WorkspaceView = () => {
    const workspaceId = useWorkspaceId();
    const { data: workspaces, isLoading } = useGetWorkspaces();
    const t = useTranslations('workspaces');
    const { canInviteMembers } = useWorkspacePermissions(); //isAdminMode
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);
    const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);
    const router = useRouter();

    useEffect(() => {
        if (workspaceId === 'create' && !canWrite) {
            router.replace('/workspaces');
        }
    }, [workspaceId, canWrite, router]);

    const [optionsView, setOptionsView] = useState<string | null>(null);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const openSettings = () => {
        setOptionsView('general');
    };

    if (workspaceId === 'create') {
        if (!canWrite) return null;
        return (
            <div className="w-[40%] mt-10">
                <CreateWorkspaceForm />
            </div>
        );
    }

    const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);

    const handleOptionClick = (key: string) => {
        if (key === 'general') {
            setOptionsView('general');
        } else if (key === 'customize') {
            setOptionsView('customize');
        } else if (key === 'add-member') {
            setShowAddMembersModal(true);
        } else if (key === 'information') {
            setShowInfoModal(true);
        } else {
            console.log(key);
        }
    };

    // usar DropdownMenuRadioGroup para cambiar de workspace
    return (
        <div className="w-[90%] ml-5">
            <div className="flex items-center gap-2">
                {isLoading || !currentWorkspace
                ? <Skeleton className="w-60 h-10" />
                : <DropdownItems
                    itemLogo={currentWorkspace.name[0].toUpperCase()}
                    itemName={currentWorkspace.name}
                    itemType="workspace"
                    currentWorkspaceId={workspaceId}
                  />}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='outline'
                            className="rounded-md size-9"
                            disabled={!!optionsView}
                        >
                            <Settings2 />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        {workspaceOptions
                            .filter(option => {
                                // ? Resolver prioridad para estos casos. El admin, incluso sin manage_users permission puede agregar miembros?
                                // if (option.key === 'add-member' && !canInviteMembers || isAdminMode)) {
                                if (option.key === 'add-member' && !canManageUsers) return false
                                if(!canInviteMembers) {
                                    return false;
                                }
                                return true;
                            })
                            .map((option) => (
                            <DropdownMenuItem
                                key={option.key}
                                className="flex items-center gap-2 p-2 cursor-pointer"
                                onClick={() => handleOptionClick(option.key)}
                            >
                                <option.icon size={18} />
                                <span>{t(option.key)}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    variant='default'
                    className='rounded-md size-9 w-24'
                    style={{ display: !optionsView ? 'none' : '' }}
                    onClick={() => setOptionsView(null)}
                >
                    {t('back')}
                </Button>
            </div>

            {optionsView === 'general' && currentWorkspace && (
                <WorkspaceSettings workspace={currentWorkspace as WorkspaceType} />
            )}
            {optionsView === 'customize' && currentWorkspace && (
                <WorkspaceCustomize workspace={currentWorkspace as WorkspaceType} />
            )}
            {!optionsView && workspaces && <TaskSwitcher openSettings={openSettings} />}

            <AddWorkspaceMembersModal
                open={showAddMembersModal}
                onOpenChange={setShowAddMembersModal}
                workspaceId={workspaceId}
            />

            {currentWorkspace && (
                <WorkspaceInfoModal
                    open={showInfoModal}
                    onOpenChange={setShowInfoModal}
                    workspace={currentWorkspace as WorkspaceType}
                />
            )}
        </div>
    );
}

export default WorkspaceView;