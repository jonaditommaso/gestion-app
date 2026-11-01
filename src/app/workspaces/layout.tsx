import { getCurrentSession } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import WorkspacesLayoutClient from "./WorkspacesLayoutClient";

interface WorkspacesLayoutProps {
    children: React.ReactNode
}

const WorkspacesLayout = async ({ children }: WorkspacesLayoutProps) => {
    const hasSession = await getCurrentSession();

    if (!hasSession) redirect('/login');

    return <WorkspacesLayoutClient>{children}</WorkspacesLayoutClient>;
}

export default WorkspacesLayout;
