import { getEffectivePermissions, Permission, RoleType } from "../constants";
import { useGetFinalRolesPermissions } from "./useGetFinalRolesPermissions";
import { useAppContext } from "@/context/AppContext";

export const useCurrentUserPermissions = () => {
    const { teamContext, isLoadingTeamContext } = useAppContext();
    const finalRolePermissions = useGetFinalRolesPermissions(!!teamContext?.membership);

    const rawRole = teamContext?.membership?.role;
    // OWNER maps to ADMIN for permission purposes (same capabilities, extended billing rights in the future)
    const role: RoleType = rawRole === 'OWNER' ? 'ADMIN' : ((rawRole as RoleType) ?? 'VIEWER');
    const permissions = finalRolePermissions.find(r => r.role === role)?.permissions ?? [] as Permission[];
    const effectivePermissions = getEffectivePermissions(permissions as string[]);

    const hasPermission = (permission: Permission): boolean => permissions.includes(permission);
    const hasGranularPermission = (permission: string): boolean => effectivePermissions.includes(permission);

    return { permissions, effectivePermissions, hasPermission, hasGranularPermission, isLoading: isLoadingTeamContext };
};
