'use client'

import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PERMISSIONS } from "@/features/roles/constants";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleCheckBig, CopyIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FadeLoader from "react-spinners/FadeLoader";
import { useInviteMember } from "../api/use-invite-member";
import { useGetTeamContext } from "../api/use-get-team-context";
import { useGetMembers } from "../api/use-get-members";
import ManageMembersModal from "./ManageMembersModal";
import NoTeamWarningIcon from "./NoTeamWarningIcon";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import UpgradeDialog from "@/components/UpgradeDialog";

// interface AddNewMemberProps {
//     user: Models.User<Models.Preferences>
// }

type InviteMode = 'url' | 'existing'
type InviteStep = 'choose' | 'form'

const AddNewMember = () => { //we receive the user quickly from server component
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<InviteMode>('url');
    const [step, setStep] = useState<InviteStep>('choose');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'CREATOR' | 'VIEWER'>('CREATOR');
    const [submittedEmail, setSubmittedEmail] = useState('');
    const { mutate: inviteMember, isPending, data, reset } = useInviteMember();
    const t = useTranslations('team');
    const { hasPermission, isLoading } = useCurrentUserPermissions();
    const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);
    const { data: teamContext } = useGetTeamContext();
    const { isFree, limits } = usePlanAccess();
    const { data: membersData } = useGetMembers();
    const hasOrg = !!teamContext?.membership;
    const isAtMemberLimit = isFree && (membersData?.members?.length ?? 0) >= limits.members;
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const isValidInviteEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim());

    const dialogDescription = step === 'choose'
        ? t('add-new-member-select-description')
        : (mode === 'url' ? t('add-new-member-description') : t('add-existing-member-description'));

    const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!isValidInviteEmail) return;

        inviteMember({
            json: {
                email: inviteEmail.trim(),
                mode,
                targetRole: inviteRole,
            }
        });

        setSubmittedEmail(inviteEmail.trim());
        setInviteEmail('');
    };

    const handleCopy = async () => {
        if (!data) return;
        try {
            await navigator.clipboard.writeText(data.invitationUrl);

        } catch (err) {
            console.error('Error copiando al portapapeles:', err);
        }
    };

    const handleCopyToken = async () => {
        if (!data?.token) return;
        try {
            await navigator.clipboard.writeText(data.token);
        } catch (err) {
            console.error('Error copiando token al portapapeles:', err);
        }
    };

    const handleClose = (open: boolean) => {
        if (!open) {
                        reset();
                        setStep('choose');
                        setMode('url');
                        setInviteEmail('');
                        setSubmittedEmail('');
                        setInviteRole('CREATOR');
        }
                setIsOpen(open);
    };

    if (isLoading || !canManageUsers) return null;

    return (
        <div>
            <DialogContainer
                isOpen={isOpen}
                setIsOpen={handleClose}
                title={t('add-new-member-title')}
                description={dialogDescription}
            >
                {!data
                    ? (isPending
                        ? (
                            <div className="w-full flex justify-center">
                                <FadeLoader color="#999" width={3} className="my-[10px]" />
                            </div>
                        ) : (
                            <AnimatePresence mode="wait" initial={false}>
                                {step === 'choose' ? (
                                    <motion.div
                                        key="invite-step-choose"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col gap-4"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setMode('url')}
                                            className={[
                                                'rounded-xl border-2 p-4 text-left transition-all',
                                                mode === 'url' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                                            ].join(' ')}
                                        >
                                            <p className="font-semibold text-sm">{t('invite-option-url-title')}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{t('invite-option-url-description')}</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMode('existing')}
                                            className={[
                                                'rounded-xl border-2 p-4 text-left transition-all',
                                                mode === 'existing' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                                            ].join(' ')}
                                        >
                                            <p className="font-semibold text-sm">{t('invite-option-existing-title')}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{t('invite-option-existing-description')}</p>
                                        </button>

                                        <div className="flex items-center justify-end gap-2">
                                            <Button onClick={() => setIsOpen(false)} variant='outline' type="button">{t('cancel')}</Button>
                                            <Button type="button" onClick={() => setStep('form')}>{t('continue')}</Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="invite-step-form"
                                        onSubmit={handleInvite}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="rounded-md border p-3 bg-muted/30">
                                                <p className="text-xs text-muted-foreground">{t('selected-invite-mode')}</p>
                                                <p className="text-sm font-medium mt-1">
                                                    {mode === 'url' ? t('invite-option-url-title') : t('invite-option-existing-title')}
                                                </p>
                                            </div>
                                            <Input
                                                type="email"
                                                placeholder="Email..."
                                                name="email-invitation"
                                                value={inviteEmail}
                                                onChange={event => setInviteEmail(event.target.value)}
                                                required
                                            />
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-xs text-muted-foreground">{t('invite-role-label')}</p>
                                                <div className="flex gap-2">
                                                    {(['ADMIN', 'CREATOR', 'VIEWER'] as const).map(r => (
                                                        <button
                                                            key={r}
                                                            type="button"
                                                            onClick={() => setInviteRole(r)}
                                                            className={[
                                                                'flex-1 rounded-md border py-1.5 px-2 text-xs font-medium transition-all',
                                                                inviteRole === r ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                                                            ].join(' ')}
                                                        >
                                                            {t(`invite-role-${r.toLowerCase() as 'admin' | 'creator' | 'viewer'}`)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button onClick={() => setStep('choose')} variant='outline' type="button" disabled={isPending}>{t('back')}</Button>
                                                <Button onClick={() => setIsOpen(false)} variant='outline' type="button" disabled={isPending}>{t('cancel')}</Button>
                                                <Button disabled={isPending || !isValidInviteEmail}>
                                                    {mode === 'url' ? t('generate-url') : t('send-existing-invite')}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        )
                    ) : (
                        <div className="max-w-[500px] gap-4 flex flex-col">
                            <Alert variant='success' className="w-full">
                                <CircleCheckBig className="h-4 w-4" />
                                <AlertTitle>{mode === 'url' ? t('invitation-url-generated') : t('existing-invitation-sent')}</AlertTitle>
                            </Alert>

                            {mode === 'url' && (
                                <div className="flex items-center justify-between border rounded-md p-1">
                                    <p className="text-sm text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap w-[80%] select-none">{data.invitationUrl}</p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' onClick={handleCopy}>
                                                <CopyIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit p-1">
                                            {t('copied')}
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}

                            {mode === 'existing' && (
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {t('existing-invitation-context', { email: submittedEmail || inviteEmail })}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{t('invite-token-label')}</p>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <p className="text-sm font-medium break-all">{data.token}</p>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' size='sm' onClick={handleCopyToken}>
                                                    <CopyIcon className="size-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-fit p-1">
                                                {t('copied')}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </DialogContainer>
            <div className="flex items-center gap-2">
                {!hasOrg && <NoTeamWarningIcon />}
                {hasOrg && <ManageMembersModal />}
                <Button
                    disabled={!hasOrg}
                    onClick={() => isAtMemberLimit ? setUpgradeDialogOpen(true) : setIsOpen(true)}
                >
                    + {t('add-new-member')}
                </Button>
            </div>
            <UpgradeDialog
                open={upgradeDialogOpen}
                onOpenChange={setUpgradeDialogOpen}
                feature="members"
                currentCount={membersData?.members?.length ?? 0}
                limitCount={limits.members}
            />
        </div>
    );
}

export default AddNewMember;