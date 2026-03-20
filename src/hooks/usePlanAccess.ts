import { useAppContext } from "@/context/AppContext";
import { planLimits } from "@/features/pricing/plan-limits";
import { OrganizationPlan } from "@/features/team/types";

export const usePlanAccess = () => {
    const { teamContext, isLoadingTeamContext: isLoading } = useAppContext();
    const plan: OrganizationPlan = teamContext?.org?.plan ?? 'FREE';
    const limits = planLimits[plan];
    const isFree = plan === 'FREE';

    return {
        plan,
        isFree,
        isLoading,
        limits,
    };
};
