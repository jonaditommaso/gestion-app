'use client'
import CreateWorkspaceForm from "@/features/workspaces/components/CreateWorkspaceForm";
import { useWorkspaceId } from "../hooks/use-workspace-id";
//import { Settings2 } from "lucide-react";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
//import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
//import { Button } from "@/components/ui/button";
//import WorkspaceSettings from "@/features/workspaces/components/WorkspaceSettings";
import DropdownItems from "@/components/DropdownItems";
import TaskSwitcher from "@/features/tasks/components/TaskSwitcher";

const WorkspaceView = () => {
    const workspaceId = useWorkspaceId();
    const { data: workspaces, isLoading } = useGetWorkspaces();

    //const [optionsView, setOptionsView] = useState(false);

    if(workspaceId === 'create') return (
        <div className="w-[40%]">
            <CreateWorkspaceForm />
        </div>
    )

    // usar DropdownMenuRadioGroup para cambiar de workspace
    return (
        <div className="w-[90%] ml-5">
            <div className="flex items-center gap-2">
                {isLoading
                ? <Skeleton className="w-60 h-10" />
                : <DropdownItems
                    itemLogo={workspaces?.documents[0]?.name[0].toUpperCase()}
                    itemName={workspaces?.documents[0]?.name}
                    itemType="workspace"
                  />}
                {/* <Button
                    variant='outline'
                    className="rounded-md size-9"
                    disabled={optionsView}
                    onClick={() => setOptionsView(true)}
                >
                    <Settings2 />
                </Button>
                <Button
                    variant='default'
                    className='rounded-md size-9 w-24'
                    style={{ display: !optionsView ? 'none' : '' }}
                    onClick={() => setOptionsView(false)}
                >
                    Regresar
                </Button> */}
            </div>

            {/* {optionsView
                ? <WorkspaceSettings /> --> //? restore when workspaceSettings really works
                : (
                    workspaces && <TaskSwitcher />
                )
            } */}
            {workspaces && <TaskSwitcher />}
        </div>
    );
}

export default WorkspaceView;