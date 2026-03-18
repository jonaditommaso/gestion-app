'use client'

import { Button } from "@/components/ui/button";
import { useReactivateSubscription } from "@/features/team/api/use-reactivate-subscription";
import { useTranslations } from "next-intl";

const ReactivateSubscriptionButton = () => {
    const t = useTranslations('organization');
    const { mutate, isPending } = useReactivateSubscription();

    return (
        <Button variant="outline" onClick={() => mutate()} disabled={isPending}>
            {t('reactivate-subscription')}
        </Button>
    );
};

export default ReactivateSubscriptionButton;
