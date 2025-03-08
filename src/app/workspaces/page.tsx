import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

const WorkspacesView = async () => {
    const workspaces = await getWorkspaces() // getWorkspaces porque es server component
    const user = await getCurrent();

    if(!user) redirect('/login');

    if(workspaces?.total === 0) {
        redirect('/workspaces/create')
    } else {
        redirect(`/workspaces/${workspaces?.documents[0].$id}`)
    }
}

export default WorkspacesView;