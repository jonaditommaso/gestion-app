// import { useInviteCodeWorkspace } from "@/app/workspaces/hooks/use-invite-code";
// import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { getCurrent } from "@/features/auth/queries";
// import { useJoinWorkspace } from "@/features/workspaces/api/use-join-workspace";
// import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

interface WorkspaceJoinViewProps {
    params: {
        workspaceId: string
    }
}

const WorkspaceJoinView = async ({ params }: WorkspaceJoinViewProps) => {
    const user = await getCurrent();
    if(!user) redirect('/login');

    // const inviteCode = useInviteCodeWorkspace();
    // const workspaceId = useWorkspaceId()
    // const { mutate, isPending } = useJoinWorkspace()

    // const workspace = await getWorkspaceInfo({
    //     workspaceId: params.workspaceId
    // })

    // const onSubmit = () => {
    //     mutate({
    //         param: { workspaceId },
    //         json: { code: inviteCode }
    //     }, {
    //         onSuccess: ({ data }) => {
    //             router.push(`/workspaces/${data.$id}`)
    //         }
    //     })
    // }

    return (
        <>join</>
    );
}

export default WorkspaceJoinView;
