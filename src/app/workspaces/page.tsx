import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { getActiveContext } from "@/features/team/server/utils";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const WorkspacesView = async () => {
    const user = await getCurrent();

    if (!user) redirect('/login');

    const { databases } = await createAdminClient();
    const cookieStore = await cookies();
    const activeMembershipId = cookieStore.get('active-org-id')?.value;
    const context = await getActiveContext(user, databases, activeMembershipId);

    const teamId = context?.org.appwriteTeamId;
    const workspaces = await getWorkspaces({ teamId });

    if (workspaces.total === 0) {
        redirect('/workspaces/create');
    } else {
        redirect(`/workspaces/${workspaces.documents[0].$id}`);
    }
}

export default WorkspacesView;