import { useCurrent } from "@/features/auth/api/use-current";
import { Permission, RoleType } from "../constants";
import { useGetFinalRolesPermissions } from "./useGetFinalRolesPermissions";

export const useCurrentUserPermissions = () => {
    const { data: user, isLoading } = useCurrent();
    const finalRolePermissions = useGetFinalRolesPermissions();

    const role = (user?.prefs?.role as RoleType) ?? 'VIEWER';
    const permissions = finalRolePermissions.find(r => r.role === role)?.permissions ?? [] as Permission[];

    const hasPermission = (permission: Permission): boolean => permissions.includes(permission);

    return { permissions, hasPermission, isLoading };
};
