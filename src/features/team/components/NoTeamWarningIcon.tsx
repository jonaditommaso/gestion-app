'use client'
import { TooltipContainer } from "@/components/TooltipContainer";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

const NoTeamWarningIcon = () => {
    const t = useTranslations('team');

    return (
        <TooltipContainer tooltipText={t('not-company-provided')}>
            <AlertTriangle className="text-yellow-400" />
        </TooltipContainer>
    );
}

export default NoTeamWarningIcon;