'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, AlertCircle, Layers, Plus, UserCheck, Users } from "lucide-react";
import { useGetSquads } from "../api/squads/use-get-squads";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";
import SquadCard from "./squads/SquadCard";
import SquadFormDialog from "./squads/SquadFormDialog";
import CreateSquadFlow from "./squads/CreateSquadFlow";
import { TaskSquad, WorkspaceMember } from "../types";
import CustomLoader from "@/components/CustomLoader";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import UpgradeDialog from "@/components/UpgradeDialog";

const SquadsPanel = () => {
    const t = useTranslations('workspaces');
    const workspaceId = useWorkspaceId();
    const [isCreating, setIsCreating] = useState(false);
    const [editingSquad, setEditingSquad] = useState<TaskSquad | null>(null);

    const { data: squadsData, isLoading: isLoadingSquads } = useGetSquads({ workspaceId });
    const { data: membersData, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
    const { data: currentUser } = useCurrent();

    const squads = (squadsData?.documents ?? []) as TaskSquad[];
    const availableMembers = ((membersData?.documents ?? []) as WorkspaceMember[]);
    const currentMember = availableMembers.find(m => m.userId === currentUser?.$id);
    const hasEnoughMembers = availableMembers.length >= 2;

    const { limits } = usePlanAccess();
    const squadLimit = limits.squads; // 0 = free (blocked), 2 = plus, -1 = unlimited
    const canCreateSquad = squadLimit === -1 || squads.length < squadLimit;
    const isSquadsBlocked = squadLimit === 0;

    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

    const isLoading = isLoadingSquads || isLoadingMembers;

    return (
        <div className="flex flex-col p-6">
            {!isCreating && (
                <div className="flex items-center justify-between mb-6 pr-8">
                    <div className="flex items-center gap-2">
                        <Users className="size-5" />
                        <h1 className="text-xl font-semibold">{t('squads')}</h1>
                        {squads.length > 0 && (
                            <span className="text-sm text-muted-foreground">({squads.length})</span>
                        )}
                    </div>
                    {squads.length > 0 && hasEnoughMembers && canCreateSquad && (
                        <Button size="sm" onClick={() => setIsCreating(true)}>
                            <Plus className="size-4 mr-1.5" />
                            {t('new-squad')}
                        </Button>
                    )}
                    {squads.length > 0 && !canCreateSquad && !isSquadsBlocked && (
                        <Button size="sm" variant="outline" onClick={() => setShowUpgradeDialog(true)}>
                            <Plus className="size-4 mr-1.5" />
                            {t('new-squad')}
                        </Button>
                    )}
                </div>
            )}

            {isCreating ? (
                <CreateSquadFlow
                    workspaceId={workspaceId}
                    availableMembers={availableMembers}
                    currentMember={currentMember}
                    onDone={() => setIsCreating(false)}
                    onCancel={() => setIsCreating(false)}
                />
            ) : isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                    <CustomLoader />
                </div>
            ) : squads.length === 0 ? (
                <div className="w-full space-y-4">
                    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/8 via-primary/4 to-background p-7">
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="space-y-1.5">
                                <p className="text-sm text-muted-foreground leading-relaxed">{t('squads-description')}</p>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/5 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-6 right-20 size-32 rounded-full bg-primary/4 blur-2xl" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-blue-500/5 dark:bg-blue-500/8 p-4 space-y-3">
                            <div className="rounded-md bg-blue-500/15 w-fit p-2">
                                <UserCheck className="size-4 text-blue-500" />
                            </div>
                            <p className="text-sm font-medium leading-snug">{t('squads-feature-assign')}</p>
                        </div>
                        <div className="rounded-lg border bg-amber-500/5 dark:bg-amber-500/8 p-4 space-y-3">
                            <div className="rounded-md bg-amber-500/15 w-fit p-2">
                                <Layers className="size-4 text-amber-500" />
                            </div>
                            <p className="text-sm font-medium leading-snug">{t('squads-feature-organize')}</p>
                        </div>
                        <div className="rounded-lg border bg-emerald-500/5 dark:bg-emerald-500/8 p-4 space-y-3">
                            <div className="rounded-md bg-emerald-500/15 w-fit p-2">
                                <Activity className="size-4 text-emerald-500" />
                            </div>
                            <p className="text-sm font-medium leading-snug">{t('squads-feature-filter')}</p>
                        </div>
                    </div>

                    {!hasEnoughMembers && (
                        <Alert variant="default">
                            <AlertCircle className="size-4" />
                            <AlertTitle>{t('squad-min-members-alert-title')}</AlertTitle>
                            <AlertDescription>{t('squad-min-members-alert-desc')}</AlertDescription>
                        </Alert>
                    )}

                    {isSquadsBlocked ? (
                        <div className="flex justify-center pt-4">
                            <Button onClick={() => setShowUpgradeDialog(true)}>
                                <Plus className="size-4 mr-1.5" />
                                {t('squad-create-first')}
                            </Button>
                        </div>
                    ) : hasEnoughMembers && canCreateSquad ? (
                        <div className="flex justify-center pt-4">
                            <Button onClick={() => setIsCreating(true)}>
                                <Plus className="size-4 mr-1.5" />
                                {t('squad-create-first')}
                            </Button>
                        </div>
                    ) : hasEnoughMembers && !canCreateSquad ? (
                        <div className="flex justify-center pt-4">
                            <Button variant="outline" onClick={() => setShowUpgradeDialog(true)}>
                                <Plus className="size-4 mr-1.5" />
                                {t('squad-create-first')}
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                    {squads.map(squad => (
                        <SquadCard
                            key={squad.$id}
                            squad={squad}
                            workspaceId={workspaceId}
                            availableMembers={availableMembers}
                            onEdit={setEditingSquad}
                        />
                    ))}
                    {!canCreateSquad && !isSquadsBlocked && (
                        <button
                            onClick={() => setShowUpgradeDialog(true)}
                            className="rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors min-h-[120px]"
                        >
                            <Plus className="size-4" />
                            {t('squad-upgrade-to-add')}
                        </button>
                    )}
                </div>
            )}

            {editingSquad && (
                <SquadFormDialog
                    open={!!editingSquad}
                    onOpenChange={open => { if (!open) setEditingSquad(null); }}
                    workspaceId={workspaceId}
                    availableMembers={availableMembers}
                    squad={editingSquad}
                />
            )}

            <UpgradeDialog
                open={showUpgradeDialog}
                onOpenChange={setShowUpgradeDialog}
                feature="squads"
                currentCount={squads.length}
                limitCount={squadLimit > 0 ? squadLimit : undefined}
            />
        </div>
    );
};

export default SquadsPanel;
