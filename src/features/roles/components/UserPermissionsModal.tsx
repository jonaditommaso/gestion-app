"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { RoleUser } from "../types"
import { useGetFinalRolesPermissions } from "../hooks/useGetFinalRolesPermissions"
import { useState } from "react"
import { useUpdateUserRole } from "../api/use-update-user-role"
import { useTranslations } from "next-intl"
import { useGetMembers } from "@/features/team/api/use-get-members"
import { ROLES, PERMISSION_CATALOG, getEffectivePermissions } from "../constants"
import { usePlanAccess } from "@/hooks/usePlanAccess"
import { ChevronDown, ChevronRight } from "lucide-react"

interface UserPermissionsDialogProps {
  onOpenChange: (open: boolean) => void
  user: RoleUser
}

export function UserPermissionsModal({ onOpenChange, user }: UserPermissionsDialogProps) {
  const t = useTranslations('roles')
  const { plan } = usePlanAccess()
  const isPro = plan === 'PRO' || plan === 'ENTERPRISE'
  const finalRolePermissions = useGetFinalRolesPermissions();
  const [roleSelected, setRoleSelected] = useState<string>(user.role.toLowerCase());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const { mutate: updateUserRole, isPending: isUpdating } = useUpdateUserRole();
  const { data: membersData } = useGetMembers();

  const adminCount = membersData?.members?.filter(m => (m.prefs?.role as string)?.toUpperCase() === ROLES.ADMIN).length ?? 0;
  const isLastAdmin = user.role.toUpperCase() === ROLES.ADMIN && adminCount <= 1;

  const rawPermissions = finalRolePermissions.find(({role}) => role.toLowerCase() === roleSelected)?.permissions || [];
  const effectivePermissions = isPro ? getEffectivePermissions(rawPermissions) : rawPermissions;

  const toggle = (moduleKey: string) => {
    setExpanded(prev => ({ ...prev, [moduleKey]: !prev[moduleKey] }))
  }

  const handleSave = () => {
    updateUserRole({
      param: { id: user.id },
      json: { role: roleSelected.toUpperCase() }
    }, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('permissions-of')} {user.name}</DialogTitle>
          <DialogDescription>{t('manage-permissions-role-description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">{t('role')}</label>
            <Select defaultValue={user.role.toLowerCase()} onValueChange={(value) => setRoleSelected(value)} disabled={isLastAdmin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {finalRolePermissions.map(({role}) => (
                  <SelectItem key={role} value={role.toLowerCase()}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">{t('individual-permissions')}</label>
            {isPro ? (
              <div className="space-y-1">
                {PERMISSION_CATALOG.map(({ moduleKey, permissions: modulePerms }) => {
                  const isOpen = !!expanded[moduleKey]
                  const activeInModule = modulePerms.filter(p => effectivePermissions.includes(p)).length
                  return (
                    <div key={moduleKey} className="border rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggle(moduleKey)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="uppercase tracking-wide text-muted-foreground">
                          {t(moduleKey)}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="text-xs font-normal">{activeInModule}/{modulePerms.length}</span>
                          {isOpen
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                          }
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {modulePerms.map(permission => (
                            <div key={permission} className="flex items-center space-x-3">
                              <Checkbox
                                id={`user-${permission}`}
                                checked={effectivePermissions.includes(permission)}
                                disabled
                              />
                              <label
                                htmlFor={`user-${permission}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {t(`perm-${permission.replace(/_/g, '-')}`)}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rawPermissions.map(permission => (
                  <div key={permission} className="flex items-start space-x-3">
                    <Checkbox id={permission} defaultChecked={user.permissions.includes(permission)} disabled />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={permission}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>{t('save-changes')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
