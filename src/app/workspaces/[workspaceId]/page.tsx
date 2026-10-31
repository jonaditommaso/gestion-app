'use client'
import CreateWorkspaceForm from "@/features/workspaces/components/CreateWorkspaceForm";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Settings2 } from "lucide-react";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
import SquadsModal from "./SquadsModal";
import { WorkspaceType } from "@/features/workspaces/types";
import WorkspaceCustomize from "./WorkspaceCustomize";
import { useWorkspacePermissions } from "../hooks/use-workspace-permissions";
import { COLOR_PRESETS } from "../constants/color-presets";
import { parseWorkspaceMetadata } from "../utils/workspace-metadata";
import { DialogContainer } from "@/components/DialogContainer";
import CreateTaskFormWrapper from "@/features/tasks/components/CreateTaskFormWrapper";
import { TaskStatus } from "@/features/tasks/types";
import CreateNewTaskButton from "@/features/tasks/components/CreateNewTaskButton";
import { Separator } from "@/components/ui/separator";

const WorkspaceView = () => {
    const workspaceId = useWorkspaceId();
    const { data: workspaces, isLoading } = useGetWorkspaces();
    const t = useTranslations('workspaces');
    const { canInviteMembers } = useWorkspacePermissions(); //isAdminMode
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);
    const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isCreatingWorkspace = searchParams.get('creating') === 'true' || workspaceId === 'create';

    const [optionsView, setOptionsView] = useState<string | null>(null);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showSquadsModal, setShowSquadsModal] = useState(false);
    const githubScrollPendingRef = useRef(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined);
    const [initialStatusCustomId, setInitialStatusCustomId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (workspaceId === 'create' && !canWrite) {
            router.replace('/workspaces');
        }
    }, [workspaceId, canWrite, router]);

    useEffect(() => {
        if (workspaceId === 'create' && !isLoading && workspaces?.documents && workspaces.documents.length > 0) {
            router.replace(`/workspaces/${workspaces.documents[0].$id}?creating=true`);
        }
    }, [workspaceId, isLoading, workspaces, router]);

    // Step 1: detect ?github_connected=true, persist intent, clean URL, refresh session
    useEffect(() => {
        if (searchParams.get('github_connected') !== 'true') return;
        sessionStorage.setItem('github_open_settings', '1');
        router.replace(pathname);
        router.refresh();
    }, [searchParams, router, pathname]);

    // Step 2: on mount (after possible refresh), open settings and arm scroll ref
    useEffect(() => {
        if (sessionStorage.getItem('github_open_settings') !== '1') return;
        sessionStorage.removeItem('github_open_settings');
        setOptionsView('general');
        githubScrollPendingRef.current = true;
        toast.success(t('github-connected-success'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Step 3: after every render, scroll if pending and element is in the DOM
    useEffect(() => {
        if (!githubScrollPendingRef.current) return;
        const el = document.getElementById('github-section');
        if (el) {
            githubScrollPendingRef.current = false;
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    const openSettings = () => {
        setOptionsView('general');
    };

    if (workspaceId === 'create') {
        if (!canWrite) return null;
        // Still loading or about to redirect to existing workspace
        if (isLoading || (workspaces?.documents && workspaces.documents.length > 0)) return null;
        // No workspaces: fall through to normal render — isCreatingWorkspace will show the overlay
    }

    const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
    const workspace = currentWorkspace as WorkspaceType | undefined;
    const workspaceMetadata = parseWorkspaceMetadata(workspace?.metadata);
    const workspaceTheme = COLOR_PRESETS.find(preset => preset.value === workspaceMetadata.backgroundColor) ?? COLOR_PRESETS[0];
    const workspaceIcon = workspaceMetadata.workspaceIcon || workspace?.name?.[0]?.toUpperCase() || 'W';

    const handleOptionClick = (key: string) => {
        if (key === 'general') {
            setOptionsView('general');
        } else if (key === 'customize') {
            setOptionsView('customize');
        } else if (key === 'add-member') {
            setShowAddMembersModal(true);
        } else if (key === 'information') {
            setShowInfoModal(true);
        } else if (key === 'manage-squads') {
            setShowSquadsModal(true);
        } else {
            console.log(key);
        }
    };

    const handleNewTask = (status?: TaskStatus, statusCustomId?: string) => {
        setInitialStatus(status);
        setInitialStatusCustomId(statusCustomId);
        setModalOpen(true);
    }

    const workspaceHeaderControls = (
        <div className="flex flex-wrap items-center gap-2">
            {isLoading || !currentWorkspace
                ? <Skeleton className="size-10" />
                : <DropdownItems
                    itemLogo={workspaceIcon}
                    itemName={workspace?.name ?? ''}
                    itemType="workspace"
                    currentWorkspaceId={workspaceId}
                    workspacesCount={{ count: workspaces?.total ?? 0 }}
                    workspaces={workspaces}
                    itemBackgroundColor={workspaceTheme.iconBackground}
                  />
            }

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='outline'
                        className="size-9 rounded-md bg-background/80 shadow-sm backdrop-blur-md"
                        disabled={!!optionsView}
                        aria-label={t('workspace-settings')}
                    >
                        <Settings2 />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                    {workspaceOptions
                        .filter(option => {
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

            {optionsView && (
                <Button
                    variant='default'
                    className='h-9 w-24 shadow-sm'
                    onClick={() => setOptionsView(null)}
                >
                    {t('back')}
                </Button>
            )}

            <Separator orientation="vertical" className="mx-2 h-6" />
        </div>
    );

    // usar DropdownMenuRadioGroup para cambiar de workspace
    return (
        <div className="w-[90%] ml-5">
            <div className={isCreatingWorkspace ? "pointer-events-none select-none blur-sm" : undefined}>
                {optionsView ? (
                    <div className="relative z-10 mb-1 flex min-h-11 flex-wrap items-center gap-2">
                        {workspaceHeaderControls}
                    </div>
                ) : null}

                {optionsView === 'general' && currentWorkspace && (
                    <WorkspaceSettings workspace={currentWorkspace as WorkspaceType} />
                )}

                {optionsView === 'customize' && currentWorkspace && (
                    <WorkspaceCustomize workspace={currentWorkspace as WorkspaceType} />
                )}

                {!optionsView && workspaceId && (
                    <TaskSwitcher
                        openSettings={openSettings}
                        handleNewTask={handleNewTask}
                        headerStart={(
                            <div className="relative z-10 flex min-w-0 flex-wrap items-center gap-2">
                                {workspaceHeaderControls}
                            </div>
                        )}
                        headerEnd={<CreateNewTaskButton handleNewTask={handleNewTask} />}
                    />
                )}
            </div>

            {isCreatingWorkspace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/10 backdrop-blur-sm">
                    <div className="px-4">
                        <CreateWorkspaceForm />
                    </div>
                </div>
            )}

            <DialogContainer title={t('create-task')} isOpen={modalOpen} setIsOpen={setModalOpen}>
                <CreateTaskFormWrapper
                    onCancel={() => setModalOpen(false)}
                    initialStatus={initialStatus}
                    initialStatusCustomId={initialStatusCustomId}
                />
            </DialogContainer>

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

            <SquadsModal
                open={showSquadsModal}
                onOpenChange={setShowSquadsModal}
            />
        </div>
    );
}

export default WorkspaceView;