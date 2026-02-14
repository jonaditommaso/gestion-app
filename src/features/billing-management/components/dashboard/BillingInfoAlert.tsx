'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    CalendarDays,
    Tags,
    TrendingUp,
    TrendingDown,
    LayoutList,
    ClockAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ViewConfig, ViewType } from "../../types";

const viewConfigs: Record<ViewType, ViewConfig> = {
    details: {
        icon: LayoutList,
        titleKey: "alert-details-title",
        descriptionKey: "alert-details-description",
        colorClass: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
    },
    calendar: {
        icon: CalendarDays,
        titleKey: "alert-calendar-title",
        descriptionKey: "alert-calendar-description",
        colorClass: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
    },
    followup: {
        icon: ClockAlert,
        titleKey: "alert-followup-title",
        descriptionKey: "alert-followup-description",
        colorClass: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
    },
    categories: {
        icon: Tags,
        titleKey: "alert-categories-title",
        descriptionKey: "alert-categories-description",
        colorClass: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
    },
    incomes: {
        icon: TrendingUp,
        titleKey: "alert-incomes-title",
        descriptionKey: "alert-incomes-description",
        colorClass: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
    },
    expenses: {
        icon: TrendingDown,
        titleKey: "alert-expenses-title",
        descriptionKey: "alert-expenses-description",
        colorClass: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
    }
};

interface BillingInfoAlertProps {
    view: ViewType;
}

const BillingInfoAlert = ({ view }: BillingInfoAlertProps) => {
    const t = useTranslations('billing');
    const config = viewConfigs[view];
    const Icon = config.icon;

    return (
        <Alert className={`mb-6 max-w-2xl ${config.colorClass}`}>
            <Icon className="h-5 w-5" />
            <AlertTitle className="font-semibold">
                {t(config.titleKey)}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm opacity-90">
                {t(config.descriptionKey)}
            </AlertDescription>
        </Alert>
    );
}

export default BillingInfoAlert;
