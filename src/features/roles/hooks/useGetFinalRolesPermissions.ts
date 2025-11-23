import { useMemo } from "react";
import { useGetRolesPermissions } from "../api/use-get-role-permissions";
import { Permission, rolePermissions, RoleType } from "../constants";

export const useGetFinalRolesPermissions = () => {
    const { data: customRolePermissions } = useGetRolesPermissions();

    const finalRolePermissions = useMemo(() => rolePermissions.map(defaultRole => {
        const customConfig = customRolePermissions?.documents?.find(custom => custom.role === defaultRole.role);

        if (customConfig) {
            return {
                role: customConfig.role as RoleType,
                permissions: customConfig.permissions as Permission[],
                $id: customConfig.$id
            };
        }
        return defaultRole;
    }), [customRolePermissions]);

    return finalRolePermissions;
}