import { getCurrent } from "@/features/auth/queries";
import PermissionsManagement from "@/features/roles/components/PermissionsManagement";
import { redirect } from "next/navigation";

const RolesView = async () => {
    const user = await getCurrent();
    if(!user) redirect('/');

    return (
        <PermissionsManagement />
    );
}

export default RolesView;