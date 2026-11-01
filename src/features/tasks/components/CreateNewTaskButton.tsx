import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";

const CreateNewTaskButton = ({ handleNewTask }: { handleNewTask: () => void }) => {

    const { canCreateTask } = useWorkspacePermissions();
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);
    const t = useTranslations('workspaces');


    if (canWrite && canCreateTask) return (
        <Button
            size='sm'
            className="h-10 w-full border border-white/50 bg-background/75 shadow-sm backdrop-blur-md hover:bg-background/90 lg:w-auto"
            variant='outline'
            onClick={() => handleNewTask()}
        >
            <PlusIcon className="size-4 mr-2" />
            {t('new')}
        </Button>
    )
    return null
}

export default CreateNewTaskButton;