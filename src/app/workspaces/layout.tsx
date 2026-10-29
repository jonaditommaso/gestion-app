'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { COLOR_PRESETS } from "./constants/color-presets";
import { MembersProvider } from "@/context/MembersContext";
import { parseWorkspaceMetadata } from "./utils/workspace-metadata";

interface WorkspacesLayoutProps {
    children: React.ReactNode
}

const WorkspacesLayout = ({ children }: WorkspacesLayoutProps) => {
    const params = useParams();
    const workspaceId = params?.workspaceId as string | undefined;
    const router = useRouter();
    const { data: workspaces, isLoading } = useGetWorkspaces();

    useEffect(() => {
        if (isLoading || !workspaceId || workspaceId === 'create') return;
        if (workspaces && !workspaces.documents.find(ws => ws.$id === workspaceId)) {
            router.replace('/workspaces');
        }
    }, [isLoading, workspaces, workspaceId, router]);

    const workspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
    const metadata = parseWorkspaceMetadata(workspace?.metadata);
    const theme = COLOR_PRESETS.find(preset => preset.value === metadata.backgroundColor);

    const content = (
        <div className="relative isolate ml-[0px] flex min-h-screen justify-center gap-10 overflow-hidden bg-background pt-[70px]">
            {theme && workspaceId !== 'create' && (
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 top-0 h-[360px] ${theme.gradient}`}
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                    }}
                />
            )}
            <div className="relative z-10 flex min-h-[calc(100vh-70px)] w-full justify-center">
                {children}
            </div>
        </div>
    );

    // Solo envolver con MembersProvider si hay un workspaceId real (no 'create')
    if (workspaceId && workspaceId !== 'create') {
        return (
            <MembersProvider workspaceId={workspaceId}>
                {content}
            </MembersProvider>
        );
    }

    return content;
}

export default WorkspacesLayout;