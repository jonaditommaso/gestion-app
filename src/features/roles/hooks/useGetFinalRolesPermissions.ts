import { useMemo } from "react";
import { useGetRolesPermissions } from "../api/use-get-role-permissions";
import { rolePermissions, RoleType } from "../constants";

export const useGetFinalRolesPermissions = (enabled?: boolean) => {
    const { data: customRolePermissions } = useGetRolesPermissions({ enabled });

    const finalRolePermissions = useMemo(() => rolePermissions.map(defaultRole => {
        const customConfig = customRolePermissions?.documents?.find(custom => custom.role === defaultRole.role);

        if (customConfig) {
            return {
                role: customConfig.role as RoleType,
                permissions: customConfig.permissions as string[],
                $id: customConfig.$id as string
            };
        }
        return { ...defaultRole, permissions: defaultRole.permissions as string[] };
    }), [customRolePermissions]);

    return finalRolePermissions;
}