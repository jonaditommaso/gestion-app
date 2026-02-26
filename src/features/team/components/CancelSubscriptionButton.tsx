'use client'

import { Button } from "@/components/ui/button";
import { useCancelSubscription } from "@/features/team/api/use-cancel-subscription";
import { useTranslations } from "next-intl";

const CancelSubscriptionButton = () => {
    const t = useTranslations('organization');
    const { mutate, isPending } = useCancelSubscription();

    return (
        <Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
            {t('cancel-subscription')}
        </Button>
    );
};

export default CancelSubscriptionButton;
