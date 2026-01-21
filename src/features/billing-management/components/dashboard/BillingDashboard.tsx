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

const BillingDashboard = () => {
    const { currentView } = useCurrentView();
    const { showAlert } = useShowAlertBilling(currentView);
    const t = useTranslations('info-messages');

    const views = {
        details: <>
            <DetailsInfoCards />
            <BillingTable />
        </>,
        calendar: <BillingCalendar />,
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