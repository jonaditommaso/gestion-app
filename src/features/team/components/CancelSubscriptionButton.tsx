'use client'

import { Button } from "@/components/ui/button";
import { useCancelSubscription } from "@/features/team/api/use-cancel-subscription";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslations } from "next-intl";

const CancelSubscriptionButton = () => {
    const t = useTranslations('organization');
    const { mutate, isPending } = useCancelSubscription();
    const [ConfirmDialog, confirm] = useConfirm(
        t('cancel-subscription-confirm-title'),
        t('cancel-subscription-confirm-message'),
        'destructive'
    );

    const handleClick = async () => {
        const ok = await confirm();
        if (!ok) return;
        mutate();
    };

    return (
        <>
            <ConfirmDialog />
            <Button variant="destructive" onClick={handleClick} disabled={isPending}>
                {t('cancel-subscription')}
            </Button>
        </>
    );
};

export default CancelSubscriptionButton;
