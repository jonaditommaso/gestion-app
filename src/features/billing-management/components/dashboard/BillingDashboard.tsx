'use client'
import { BillingTable } from "../details/BillingTable";
import Image from "next/image";
import DetailsInfoCards from "../details/DetailsInfoCards";
import AllCategoriesTable from "../categories/AllCategoriesTable";
import OperationStats from "../stats/OperationStats";
import { useCurrentView } from "../../hooks/useCurrentView";
import BillingCalendar from "../calendar/BillingCalendar";
import { useTranslations } from "next-intl";
import BillingInfoAlert from "./BillingInfoAlert";
import { useShowAlertBilling } from "../../hooks/useShowAlertBilling";
import { ViewType } from "../../types";
import FollowUpPanel from "../followup/FollowUpPanel";
import MonthlyComparison from "../details/MonthlyComparison";
import { useGetOperations } from "../../api/use-get-operations";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BellRing } from "lucide-react";

const BillingDashboard = () => {
    const { currentView } = useCurrentView();
    const { showAlert } = useShowAlertBilling(currentView);
    const { data: operationsData } = useGetOperations();
    const t = useTranslations('info-messages');
    const tBilling = useTranslations('billing');

    const dueSoonCount = useMemo(() => {
        const todayStart = dayjs().startOf('day');
        const dueSoonEnd = dayjs().add(3, 'day').endOf('day');

        return (operationsData?.documents || []).filter((operation) => {
            if ((operation.status || 'PENDING') !== 'PENDING' || !operation.dueDate) return false;
            const dueDate = dayjs(operation.dueDate);

            return (dueDate.isAfter(todayStart) || dueDate.isSame(todayStart, 'day'))
                && (dueDate.isBefore(dueSoonEnd) || dueDate.isSame(dueSoonEnd, 'day'));
        }).length;
    }, [operationsData]);

    const views = {
        details: <>
            {dueSoonCount > 0 && (
                <Alert className="mb-4 max-w-[1050px] border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <BellRing className="h-4 w-4" />
                    <AlertTitle>{tBilling('due-reminder-title')}</AlertTitle>
                    <AlertDescription>{tBilling('due-reminder-description', { count: dueSoonCount })}</AlertDescription>
                </Alert>
            )}
            <DetailsInfoCards />
            <MonthlyComparison />
            <BillingTable />
        </>,
        calendar: <BillingCalendar />,
        followup: <FollowUpPanel />,
        categories: <AllCategoriesTable />,
        incomes: <OperationStats type="incomes" />,
        expenses: <OperationStats type="expenses" />
    };

    const currentViewContent = views[currentView as keyof typeof views];

    return (
        <div className="flex flex-col items-center w-full">
            {showAlert && <BillingInfoAlert view={currentView as ViewType} />}
            {currentViewContent ?? (
                <div>
                    <Image src={'/working.svg'} alt='working' width={600} height={600} />
                    <p className="p-4 text-center">{t('working')}</p>
                </div>
            )}
        </div>
    );
}

export default BillingDashboard;