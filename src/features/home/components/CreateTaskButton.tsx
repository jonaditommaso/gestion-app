'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRightLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { DialogContainer } from "@/components/DialogContainer";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useHomeCustomization } from "@/features/home/components/customization";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TooltipContainer } from "@/components/TooltipContainer";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { WorkspaceType } from "@/features/workspaces/types";

const CreateTaskFormWrapper = dynamic(
    () => import("@/features/tasks/components/CreateTaskFormWrapper"),
    { loading: () => <></> }
);

const CreateTaskButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const t = useTranslations('home');
    const { config, setDefaultWorkspaceId } = useHomeCustomization();

    const { data: workspacesData } = useGetWorkspaces();
    const workspaces = (workspacesData?.documents ?? []) as unknown as WorkspaceType[];

    const selectedWorkspace: WorkspaceType | undefined =
        workspaces.find((w) => w.$id === config.defaultWorkspaceId) ?? workspaces[0];

    const hasMultiple = workspaces.length > 1;
    const actionDisabled = workspacesData !== undefined && workspaces.length === 0;

    const handleOpen = () => {
        if (actionDisabled) return;
        setIsOpen(true);
    };

    const Trigger = (
        <Button
            className={cn("w-full py-11 h-auto flex-col gap-1", actionDisabled ? 'opacity-50 cursor-default hover:bg-transparent' : '')}
            variant="outline"
            onClick={handleOpen}
        >
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>{t('new-task')}</span>
                </div>
                {selectedWorkspace && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-muted-foreground truncate max-w-full">
                            {selectedWorkspace.name}
                        </span>
                        {hasMultiple && (
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPopoverOpen(true);
                                        }}
                                    >
                                        <ArrowRightLeft className="h-3 w-3" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="center">
                                    {workspaces.map((ws) => (
                                        <button
                                            key={ws.$id}
                                            className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors truncate block ${ws.$id === selectedWorkspace.$id ? 'font-semibold' : ''}`}
                                            onClick={() => {
                                                setDefaultWorkspaceId(ws.$id);
                                                setPopoverOpen(false);
                                            }}
                                        >
                                            {ws.name}
                                        </button>
                                    ))}
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}
        </Button>
    );

    return (
        <>
            <DialogContainer
                title={t('new-task')}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            >
                <CreateTaskFormWrapper
                    onCancel={() => setIsOpen(false)}
                    workspaceId={selectedWorkspace?.$id}
                />
            </DialogContainer>

            {actionDisabled
                ? (
                    <TooltipContainer tooltipText={t('no-workspaces')}>
                        {Trigger}
                    </TooltipContainer>
                )
                : (
                    <div>{Trigger}</div>
                )
            }
        </>
    );
};

export default CreateTaskButton;
