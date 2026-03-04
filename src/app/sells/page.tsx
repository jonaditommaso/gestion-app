import { getCurrent } from "@/features/auth/queries";
import SalesPipelineView from "@/features/sells/components/SalesPipelineView";
import { redirect } from "next/navigation";

const SellsPage = async () => {
  const user = await getCurrent();

  if (!user) redirect('/');

  return <SalesPipelineView />;
};

export default SellsPage;