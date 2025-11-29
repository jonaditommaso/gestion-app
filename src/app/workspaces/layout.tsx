'use client'

import { useParams } from "next/navigation";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { COLOR_PRESETS } from "./constants/color-presets";
import { MembersProvider } from "@/context/MembersContext";

interface WorkspacesLayoutProps {
    children: React.ReactNode
}

const WorkspacesLayout = ({ children }: WorkspacesLayoutProps) => {
    const params = useParams();
    const workspaceId = params?.workspaceId as string | undefined;
    const { data: workspaces } = useGetWorkspaces();

    // Get background color from workspace metadata
    const getBackgroundClass = () => {
        if (!workspaces || !workspaceId) return 'bg-background';

        const workspace = workspaces.documents.find(ws => ws.$id === workspaceId);
        if (!workspace) return 'bg-background';

        try {
            if (workspace.metadata) {
                const metadata = typeof workspace.metadata === 'string'
                    ? JSON.parse(workspace.metadata)
                    : workspace.metadata;
                const color = metadata.backgroundColor;

                const preset = COLOR_PRESETS.find(p => p.value === color);
                return preset?.gradient || 'bg-background';
            }
        } catch (error) {
            console.error('Error parsing workspace metadata:', error);
        }
        return 'bg-background';
    };

    const content = (
        <div className={`ml-[0px] flex justify-center pt-[70px] gap-10 min-h-screen transition-colors ${getBackgroundClass()}`}>
            {children}
        </div>
    );

    // Solo envolver con MembersProvider si hay un workspaceId
    if (workspaceId) {
        return (
            <MembersProvider workspaceId={workspaceId}>
                {content}
            </MembersProvider>
        );
    }

    return content;
}

export default WorkspacesLayout;