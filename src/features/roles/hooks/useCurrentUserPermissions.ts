import { useCurrent } from "@/features/auth/api/use-current";
import { Permission, RoleType } from "../constants";
import { useGetFinalRolesPermissions } from "./useGetFinalRolesPermissions";
import { useGetTeamContext } from "@/features/team/api/use-get-team-context";

export const useCurrentUserPermissions = () => {
    const { isLoading: isLoadingUser } = useCurrent();
    const { data: teamContext, isLoading: isLoadingContext } = useGetTeamContext();
    const finalRolePermissions = useGetFinalRolesPermissions(!!teamContext?.membership);

    const rawRole = teamContext?.membership?.role;
    // OWNER maps to ADMIN for permission purposes (same capabilities, extended billing rights in the future)
    const role: RoleType = rawRole === 'OWNER' ? 'ADMIN' : ((rawRole as RoleType) ?? 'VIEWER');
    const permissions = finalRolePermissions.find(r => r.role === role)?.permissions ?? [] as Permission[];

    const hasPermission = (permission: Permission): boolean => permissions.includes(permission);

    return { permissions, hasPermission, isLoading: isLoadingUser || isLoadingContext };
};
