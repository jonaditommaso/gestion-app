import { getCurrentSession } from "@/features/auth/queries";
import PermissionsManagement from "@/features/roles/components/PermissionsManagement";
import { redirect } from "next/navigation";

const RolesView = async () => {
    const hasSession = await getCurrentSession();

    if (!hasSession) redirect('/login');

    return (
        <PermissionsManagement />
    );
}

export default RolesView;