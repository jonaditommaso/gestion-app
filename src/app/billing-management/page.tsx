import { getCurrent } from "@/features/auth/queries";
import BillingMenu from "@/features/billing-management/components/menu/BillingMenu";
import { BillingTable } from "@/features/billing-management/components/BillingTable";
import InfoCard from "@/features/billing-management/components/InfoCard";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

const BillingManagementView = async () => {
    const user = await getCurrent();

    if(!user) redirect('/login');

    return (
        <div className="w-full flex mt-24">
            <div className="flex flex-col items-center w-full">
                <div className="flex justify-center">
                    <InfoCard Icon={TrendingUp} colorIcon='#0bb314' numberMoney={13200} />
                    <InfoCard Icon={TrendingDown} colorIcon='#f03410' numberMoney={1200} />
                    <InfoCard Icon={Scale} colorIcon='#3f51b5' numberMoney={12000} />
                </div>
                <div className="w-[900px] mt-10">
                    <BillingTable />
                </div>
            </div>
            <BillingMenu />
        </div>
    );
}

export default BillingManagementView;