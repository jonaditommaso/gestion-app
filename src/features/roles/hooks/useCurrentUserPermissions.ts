import { Permission, RoleType } from "../constants";
import { useGetFinalRolesPermissions } from "./useGetFinalRolesPermissions";
import { useAppContext } from "@/context/AppContext";

export const useCurrentUserPermissions = () => {
    const { isLoadingUser, teamContext, isLoadingTeamContext: isLoadingContext } = useAppContext();
    const finalRolePermissions = useGetFinalRolesPermissions(!!teamContext?.membership);

    const rawRole = teamContext?.membership?.role;
    // OWNER maps to ADMIN for permission purposes (same capabilities, extended billing rights in the future)
    const role: RoleType = rawRole === 'OWNER' ? 'ADMIN' : ((rawRole as RoleType) ?? 'VIEWER');
    const permissions = finalRolePermissions.find(r => r.role === role)?.permissions ?? [] as Permission[];

    const hasPermission = (permission: Permission): boolean => permissions.includes(permission);

    return { permissions, hasPermission, isLoading: isLoadingUser || isLoadingContext };
};
