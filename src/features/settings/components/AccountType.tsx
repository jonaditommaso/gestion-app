'use client'

import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { useGetTeamContext } from "@/features/team/api/use-get-team-context";
import { useLeaveOrganization } from "@/features/team/api/use-leave-organization";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslations } from "next-intl";
import { useState } from "react";

const getOrganizationRoleLabel = (role: string): string => {
    if (role === 'OWNER') return 'Owner';
    if (role === 'ADMIN') return 'Admin';
    return 'Member';
};

const AccountType = () => {
    const { data: teamContext } = useGetTeamContext();
    const { mutate: leaveOrganization, isPending } = useLeaveOrganization();
    const t = useTranslations('settings');
    const [isOpen, setIsOpen] = useState(false);
    const [LeaveConfirmDialog, confirmLeave] = useConfirm(
        t('leave-organization-confirm-title'),
        t('leave-organization-confirm-description'),
        'destructive'
    );

    const currentOrgName = teamContext?.org?.name ?? t('no-active-organization');
    const currentRole = getOrganizationRoleLabel(teamContext?.membership?.role ?? 'VIEWER');
    const allContexts = teamContext?.allContexts ?? [];
    const hasMultipleOrganizations = allContexts.length > 1;
    const canLeaveOrganization = teamContext?.membership?.role && teamContext.membership.role !== 'OWNER';

    const onLeaveOrganization = async () => {
        const ok = await confirmLeave();

        if (!ok) return;

        leaveOrganization();
    };

    return (
        <div className="text-center flex flex-col gap-3">
            <div className="flex justify-between items-center gap-10">
                <p className="text-base">{t('current-organization')}</p>
                <p className="text-sm text-muted-foreground">{currentOrgName}</p>
            </div>
            <div className="flex justify-between items-center gap-10">
                <p className="text-base">{t('organization-role')}</p>
                <p className="text-sm text-muted-foreground">{currentRole}</p>
            </div>

            {hasMultipleOrganizations && (
                <div className="flex justify-end mt-4">
                    <Button variant='outline' size='sm' onClick={() => setIsOpen(true)}>
                        {t('view-my-organizations')}
                    </Button>
                </div>
            )}

            {canLeaveOrganization && (
                <div className="flex justify-end">
                    <Button variant='destructive' size='sm' onClick={onLeaveOrganization} disabled={isPending}>
                        {t('leave-organization')}
                    </Button>
                </div>
            )}

            <DialogContainer
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title={t('my-organizations-title')}
                description={t('my-organizations-description')}
            >
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                    {allContexts.map(context => (
                        <div key={context.membership.$id} className="flex items-center justify-between border rounded-md p-3">
                            <p className="text-sm font-medium">{context.org.name}</p>
                            <p className="text-xs text-muted-foreground">{getOrganizationRoleLabel(context.membership.role)}</p>
                        </div>
                    ))}
                </div>
            </DialogContainer>

            <LeaveConfirmDialog />
        </div>
    );
}

export default AccountType;