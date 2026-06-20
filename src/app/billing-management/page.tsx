import { getCurrentSession } from "@/features/auth/queries";
import BillingMenu from "@/features/billing-management/components/menu/BillingMenu";

import { redirect } from "next/navigation";
import BillingDashboard from "@/features/billing-management/components/dashboard/BillingDashboard";

const BillingManagementView = async () => {
    const hasSession = await getCurrentSession();

    if (!hasSession) redirect('/login');

    return (
        <div className="w-full flex mt-24">
            <BillingDashboard />
            <BillingMenu />
        </div>
    );
}

export default BillingManagementView;