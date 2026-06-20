import { getCurrentSession } from "@/features/auth/queries";
import SalesPipelineView from "@/features/sells/components/SalesPipelineView";
import { redirect } from "next/navigation";

const SellsPage = async () => {
    const hasSession = await getCurrentSession();

    if (!hasSession) redirect('/login');

  return <SalesPipelineView />;
};

export default SellsPage;