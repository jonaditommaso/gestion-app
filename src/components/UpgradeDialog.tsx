'use client'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useGetMembers, TeamMember } from "@/features/team/api/use-get-members";
import { useCreateNotification } from "@/features/notifications/api/use-create-notification";
import { useAppContext } from "@/context/AppContext";
import { NotificationEntityType, NotificationType } from "@/features/notifications/types";

type UpgradeFeature = 'members' | 'pipelines' | 'workspaces' | 'squads';

interface UpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feature: UpgradeFeature;
    currentCount?: number;
    limitCount?: number;
}

const FEATURE_IMAGES: Record<UpgradeFeature, string> = {
    members: '/team.svg',
    pipelines: '/pipeline.svg',
    workspaces: '/workspace.svg',
    squads: '/group-solution.svg',
};

const FEATURE_IMAGE_SIZES: Record<UpgradeFeature, { width: number; height: number }> = {
    members: { width: 400, height: 400 },
    pipelines: { width: 250, height: 250 },
    workspaces: { width: 250, height: 250 },
    squads: { width: 250, height: 250 },
};

const UpgradeDialog = ({ open, onOpenChange, feature, currentCount, limitCount }: UpgradeDialogProps) => {
    const t = useTranslations('plan-limits');
    const { plan } = usePlanAccess();
    const { teamContext, currentUser } = useAppContext();
    const { data: teamMembers } = useGetMembers();
    const { mutate: createNotification, isPending: isNotifying } = useCreateNotification();

    const isOwner = teamContext?.membership?.role === 'OWNER';

    const featureConfig: Record<UpgradeFeature, { title: string; description: string; ctaDescription: string; resource: string; notifyOwnerTitle: string }> = {
        members: {
            title: t('upgrade-dialog-members-title'),
            description: t('upgrade-dialog-members-description', { limit: limitCount ?? 0 }),
            ctaDescription: t('upgrade-dialog-members-cta-description'),
            resource: t('upgrade-dialog-members-resource'),
            notifyOwnerTitle: t('upgrade-dialog-notify-owner-members', { name: currentUser?.name ?? '' }),
        },
        pipelines: {
            title: t('upgrade-dialog-pipelines-title'),
            description: t('upgrade-dialog-pipelines-description', { limit: limitCount ?? 0 }),
            ctaDescription: t('upgrade-dialog-pipelines-cta-description'),
            resource: t('upgrade-dialog-pipelines-resource'),
            notifyOwnerTitle: t('upgrade-dialog-notify-owner-pipelines', { name: currentUser?.name ?? '' }),
        },
        workspaces: {
            title: t('upgrade-dialog-workspaces-title'),
            description: t('upgrade-dialog-workspaces-description', { limit: limitCount ?? 0 }),
            ctaDescription: t('upgrade-dialog-workspaces-cta-description'),
            resource: t('upgrade-dialog-workspaces-resource'),
            notifyOwnerTitle: t('upgrade-dialog-notify-owner-workspaces', { name: currentUser?.name ?? '' }),
        },
        squads: {
            title: t('upgrade-dialog-squads-title'),
            description: t('upgrade-dialog-squads-description', { limit: limitCount ?? 0 }),
            ctaDescription: t('upgrade-dialog-squads-cta-description'),
            resource: t('upgrade-dialog-squads-resource'),
            notifyOwnerTitle: t('upgrade-dialog-notify-owner-squads', { name: currentUser?.name ?? '' }),
        },
    };

    const { title, description, ctaDescription, resource, notifyOwnerTitle } = featureConfig[feature];
    const imageSrc = FEATURE_IMAGES[feature];
    const { width, height } = FEATURE_IMAGE_SIZES[feature];

    const handleNotifyOwner = () => {
        const ownerMember = teamMembers?.members?.find((m: TeamMember) => m.prefs.role === 'OWNER');
        if (!ownerMember) return;

        createNotification(
            {
                json: {
                    userId: ownerMember.userId,
                    title: notifyOwnerTitle,
                    type: NotificationType.RECURRING,
                    entityType: NotificationEntityType.PLAN_LIMIT_REACHED,
                },
            },
            { onSuccess: () => onOpenChange(false) }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <DialogDescription className="sr-only">{description}</DialogDescription>
                <div className="px-7 pt-8 pb-7">
                    <div className="flex items-start gap-5">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-semibold leading-snug mb-4">
                                {isOwner ? title : t('upgrade-dialog-team-limit-reached')}
                            </h2>
                            {isOwner && (
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 tracking-wide uppercase">
                                        {plan}
                                    </span>
                                    {currentCount !== undefined && limitCount !== undefined && (
                                        <span className="text-xs text-muted-foreground tabular-nums font-medium">
                                            {currentCount}/{limitCount} {resource}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <>
                            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed whitespace-pre-line rounded-md border border-border/60 bg-muted/50 px-2 py-1.5">
                                {description}
                            </p>
                            <p className="text-base text-muted-foreground mt-4 leading-relaxed whitespace-pre-line text-center font-semibold">
                                {ctaDescription}
                            </p>
                        </>
                    )}
                </div>
                <div className="flex justify-center py-4">
                    <Image width={width} height={height} alt={feature} src={imageSrc} />
                </div>
                <div className="px-4 pt-6 pb-2 flex gap-2.5 justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('upgrade-dialog-cancel')}
                    </Button>
                    {isOwner ? (
                        <Button asChild>
                            <Link href="/pricing" onClick={() => onOpenChange(false)}>
                                <span className="flex-1 text-left">{t('upgrade-dialog-view-plans')}</span>
                                <ArrowRight className="w-4 h-4 shrink-0" />
                            </Link>
                        </Button>
                    ) : (
                        <Button onClick={handleNotifyOwner} disabled={isNotifying}>
                            <Bell className="w-4 h-4 shrink-0" />
                            <span>{t('upgrade-dialog-notify-admin')}</span>
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpgradeDialog;
