'use client'
import CreateWorkspaceForm from "@/features/workspaces/components/CreateWorkspaceForm";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Settings2 } from "lucide-react";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useState } from "react";
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

const WorkspaceView = () => {
    const workspaceId = useWorkspaceId();
    const { data: workspaces, isLoading } = useGetWorkspaces();
    const t = useTranslations('workspaces');

    const [optionsView, setOptionsView] = useState<string | null>(null);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    if(workspaceId === 'create') return (
        <div className="w-[40%]">
            <CreateWorkspaceForm />
        </div>
    )

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
                        {workspaceOptions.map((option) => (
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
                    Regresar
                </Button>
            </div>

            {optionsView === 'general' && <WorkspaceSettings />}
            {optionsView === 'customize' && currentWorkspace && (
                <WorkspaceCustomize workspace={currentWorkspace as WorkspaceType} />
            )}
            {!optionsView && workspaces && <TaskSwitcher />}
            {/* {workspaces && <TaskSwitcher />} */}

            <AddWorkspaceMembersModal
                open={showAddMembersModal}
                onOpenChange={setShowAddMembersModal}
                workspaceId={workspaceId}
                currentMembers={[]} // TODO: Obtener los miembros actuales del workspace
            />

            {currentWorkspace && (
                <WorkspaceInfoModal
                    open={showInfoModal}
                    onOpenChange={setShowInfoModal}
                    workspace={currentWorkspace as WorkspaceType}
                    members={[]} // TODO: Obtener los miembros actuales del workspace
                />
            )}
        </div>
    );
}

export default WorkspaceView;