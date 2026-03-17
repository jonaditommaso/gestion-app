import { useGetTeamContext } from "@/features/team/api/use-get-team-context";
import { planLimits } from "@/features/pricing/plan-limits";
import { OrganizationPlan } from "@/features/team/types";

export const usePlanAccess = () => {
    const { data: teamContext, isLoading } = useGetTeamContext();
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
