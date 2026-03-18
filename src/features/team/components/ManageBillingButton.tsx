'use client'

import { Button } from "@/components/ui/button";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type BillingPortalPost = typeof client.api.team['billing-portal']['$post'];
type ResponseType = InferResponseType<BillingPortalPost, 200>;

const ManageBillingButton = () => {
    const t = useTranslations('organization');
    const [isPending, setIsPending] = useState(false);

    const handleClick = async () => {
        setIsPending(true);
        try {
            const response = await client.api.team['billing-portal'].$post();
            if (!response.ok) throw new Error();
            const { url } = await response.json() as ResponseType;
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            toast.error(t('billing-portal-error'));
            setIsPending(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
            {t('manage-billing')}
        </Button>
    );
};

export default ManageBillingButton;
