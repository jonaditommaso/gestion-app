"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { RoleType } from "../constants"
import { useState } from "react"
import { useUpdateRolePermissions } from "../api/use-update-role-permissions"
import { PERMISSIONS, PERMISSION_CATALOG, ROLE_METADATA, getEffectivePermissions } from "../constants"
import { useTranslations } from "next-intl"
import { useCreateRolePermissions } from "../api/use-create-role-permissions"
import { usePlanAccess } from "@/hooks/usePlanAccess"
import { useGetTeamContext } from "@/features/team/api/use-get-team-context"
import { ChevronDown, ChevronRight } from "lucide-react"

// Base permission → granular prefix groups
const BASE_PREFIXES: Record<string, string[]> = {
  read:         ["view_"],
  write:        ["create_", "edit_", "send_", "public_", "feature_", "schedule_", "move_", "mark_", "duplicate_", "comment_", "share_", "set_", "add_"],
  delete:       ["delete_", "archive_", "restore_", "revert_"],
  manage_users: ["invite_", "remove_", "manage_"],
}

const BASE_VALUES = new Set(Object.values(PERMISSIONS) as string[])
const ALL_GRANULARS = PERMISSION_CATALOG.flatMap(m => m.permissions).filter(p => !BASE_VALUES.has(p))

function granularsForBase(base: string): string[] {
  const prefixes = BASE_PREFIXES[base] ?? []
  return ALL_GRANULARS.filter(p => prefixes.some(prefix => p.startsWith(prefix)))
}

function baseForGranular(perm: string): string | null {
  for (const [base, prefixes] of Object.entries(BASE_PREFIXES)) {
    if (prefixes.some(prefix => perm.startsWith(prefix))) return base
  }
  return null
}

// Base permissions that require 'read' to be logically valid
const REQUIRES_READ = new Set(["write", "delete", "manage_users", "manage_subscription"])

function applyToggle(prev: string[], permission: string): string[] {
  const isChecked = prev.includes(permission)
  const isBase = BASE_VALUES.has(permission)

  if (isChecked) {
    // --- UNCHECKING ---
    let next = prev.filter(p => p !== permission)

    if (isBase) {
      // Remove all granulars belonging to this base
      const granulars = granularsForBase(permission)
      next = next.filter(p => !granulars.includes(p))

      // Unchecking 'read' forces removal of everything that depends on it
      if (permission === PERMISSIONS.READ) {
        for (const dep of Array.from(REQUIRES_READ)) {
          next = next.filter(p => p !== dep)
          next = next.filter(p => !granularsForBase(dep).includes(p))
        }
      }
    }
    return next
  } else {
    // --- CHECKING ---
    const next = [...prev, permission]

    if (isBase) {
      // Add granulars for this base
      for (const g of granularsForBase(permission)) {
        if (!next.includes(g)) next.push(g)
      }
      // Ensure 'read' is present if this base requires it
      if (REQUIRES_READ.has(permission) && !next.includes(PERMISSIONS.READ)) {
        next.push(PERMISSIONS.READ)
        for (const g of granularsForBase(PERMISSIONS.READ)) {
          if (!next.includes(g)) next.push(g)
        }
      }
    } else {
      // Granular: auto-add its base if missing
      const base = baseForGranular(permission)
      if (base && !next.includes(base)) next.push(base)
      // Ensure read is always present
      if (!next.includes(PERMISSIONS.READ)) next.push(PERMISSIONS.READ)
    }

    return next
  }
}

interface RoleEditDialogProps {
  onOpenChange: (open: boolean) => void
  selectedRole: { role: RoleType; permissions: string[], $id?: string } | null,
  setSelectedRole: (role: { role: RoleType; permissions: string[], $id?: string } | null) => void
}

function RoleEditModal({ onOpenChange, selectedRole, setSelectedRole }: RoleEditDialogProps) {
  const t = useTranslations('roles')
  const { plan } = usePlanAccess()
  const isPro = plan === 'PRO' || plan === 'ENTERPRISE'
  const { data: teamContext } = useGetTeamContext()
  const isOwner = teamContext?.membership?.role === 'OWNER'

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    isPro ? getEffectivePermissions(selectedRole?.permissions || []) : (selectedRole?.permissions || [])
  )
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const { mutate: updateRolePermissions, isPending: isUpdating } = useUpdateRolePermissions()
  const { mutate: createRolePermissions, isPending: isCreating } = useCreateRolePermissions()

  if (!selectedRole) return null

  const toggle = (moduleKey: string) => {
    setExpanded(prev => ({ ...prev, [moduleKey]: !prev[moduleKey] }))
  }

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => applyToggle(prev, permission))
  }

  const handleSave = () => {
    if (selectedRole.$id) {
      updateRolePermissions({
        param: { roleId: selectedRole.$id },
        json: { permissions: selectedPermissions }
      }, {
        onSuccess: () => onOpenChange(false)
      })
    } else {
      createRolePermissions({
        json: { role: selectedRole.role, permissions: selectedPermissions }
      }, {
        onSuccess: () => onOpenChange(false)
      })
    }
  }

  const handleClose = () => {
    setSelectedRole(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('edit-role')}: <span className={`text-${ROLE_METADATA[selectedRole.role].color}`}>{t(ROLE_METADATA[selectedRole.role].name)}</span></DialogTitle>
          <DialogDescription>{t('edit-role-description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-4 block">{t('permissions')}</label>
            {isPro ? (
              <div className="space-y-1">
                {PERMISSION_CATALOG.map(({ moduleKey, permissions: modulePerms }) => {
                  // Filter manage_subscription from non-owners
                  const visiblePerms = moduleKey === "module-general" && !isOwner
                    ? modulePerms.filter(p => p !== PERMISSIONS.MANAGE_SUBSCRIPTION)
                    : modulePerms
                  const isOpen = !!expanded[moduleKey]
                  const checkedInModule = visiblePerms.filter(p => selectedPermissions.includes(p)).length
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
                          <span className="text-xs font-normal">{checkedInModule}/{visiblePerms.length}</span>
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t px-4 py-3 space-y-2">
                          {visiblePerms.map((permission) => {
                            const permKey = permission.replace(/_/g, '-')
                            return (
                              <div key={permission} className="flex items-center space-x-3">
                                <Checkbox
                                  id={`role-${permission}`}
                                  checked={selectedPermissions.includes(permission)}
                                  onCheckedChange={() => handlePermissionToggle(permission)}
                                />
                                <label htmlFor={`role-${permission}`} className="text-sm font-medium leading-none cursor-pointer">
                                  {t(`perm-${permKey}`)}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(PERMISSIONS)
                  .filter(p => isOwner || p !== PERMISSIONS.MANAGE_SUBSCRIPTION)
                  .map((permission) => (
                    <div key={permission} className="flex items-start space-x-3">
                      <Checkbox
                        id={`role-${permission}`}
                        checked={selectedPermissions.includes(permission)}
                        onCheckedChange={() => handlePermissionToggle(permission)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor={`role-${permission}`} className="text-sm font-medium leading-none cursor-pointer">
                          {permission}
                        </label>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUpdating || isCreating}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || isCreating}>
              {isUpdating || isCreating ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleEditModal