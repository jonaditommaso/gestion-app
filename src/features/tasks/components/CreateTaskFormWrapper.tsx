import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Loader } from "lucide-react";
import CreateTaskForm from "./CreateTaskForm";

interface CreateTaskFormWrapperProps {
    onCancel: () => void
}

const CreateTaskFormWrapper = ({ onCancel }: CreateTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId()

    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId })

    const memberOptions = members?.documents.map(member => ({
        id: member.$id,
        name: member.name
    }));

    if (isLoadingMembers) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <CreateTaskForm memberOptions={memberOptions} onCancel={onCancel} />
    );
}

export default CreateTaskFormWrapper;