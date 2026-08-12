import { getCurrentSession } from "@/features/auth/queries";

import { redirect } from "next/navigation";
import BillingDashboard from "@/features/billing-management/components/dashboard/BillingDashboard";

const BillingManagementView = async () => {
    const hasSession = await getCurrentSession();

    if (!hasSession) redirect('/login');

    return (
        <div className="w-full">
            <BillingDashboard />
        </div>
    );
}

export default BillingManagementView;