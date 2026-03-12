"use client"

import { useState } from "react"
import { Info, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { PERMISSION_CATALOG, getPermissionBadgeColor } from "../constants"

export function PermissionsInfoDialog() {
    const t = useTranslations("roles")
    const [open, setOpen] = useState(false)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    const toggle = (moduleKey: string) => {
        setExpanded(prev => ({ ...prev, [moduleKey]: !prev[moduleKey] }))
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Info className="w-4 h-4 mr-2" />
                {t("view-permissions")}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("available-permissions")}</DialogTitle>
                        <DialogDescription>
                            {t("available-permissions-description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1 mt-2">
                        {PERMISSION_CATALOG.map(({ moduleKey, permissions }) => {
                            const isOpen = !!expanded[moduleKey]
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
                                            <span className="text-xs font-normal">{permissions.length}</span>
                                            {isOpen
                                                ? <ChevronDown className="w-4 h-4" />
                                                : <ChevronRight className="w-4 h-4" />
                                            }
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <table className="w-full text-sm border-t">
                                            <thead>
                                                <tr className="border-b bg-muted/30">
                                                    <th className="text-left font-medium px-4 py-2 w-48">
                                                        {t("permission-col")}
                                                    </th>
                                                    <th className="text-left font-medium px-4 py-2">
                                                        {t("description-col")}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {permissions.map((perm) => {
                                                    const permKey = perm.replace(/_/g, "-")
                                                    return (
                                                        <tr key={perm} className="border-b last:border-0">
                                                            <td className="py-2 px-4">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPermissionBadgeColor(perm)}`}
                                                                >
                                                                    {t(`perm-${permKey}`)}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-4 text-muted-foreground">
                                                                {t(`perm-desc-${permKey}`)}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
