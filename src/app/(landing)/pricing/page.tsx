'use client'
import PricingSection from '../../../features/landing/components/PricingSection';
import PricingComparisonTable from '../../../features/landing/components/PricingComparisonTable';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { useTranslations } from 'next-intl';
import { useCurrent } from '@/features/auth/api/use-current';
import { useGetTeamContext } from '@/features/team/api/use-get-team-context';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { useChangePlan } from '@/features/team/api/use-change-plan';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PricingView = () => {
    const t = useTranslations('pricing');
    const { data: user, isLoading: isLoadingUser } = useCurrent();
    const { data: teamContext, isLoading: isLoadingTeam } = useGetTeamContext();
    const { plan } = usePlanAccess();
    const router = useRouter();
    const { mutate: changePlan } = useChangePlan(() => router.push('/organization'));

    const isAuthenticated = !!user;
    const isOwner = teamContext?.membership?.role === 'OWNER';
    const isLoading = isLoadingUser || isLoadingTeam;

    useEffect(() => {
        if (!isLoading && isAuthenticated && !isOwner) {
            router.replace('/organization');
        }
    }, [isLoading, isAuthenticated, isOwner, router]);

    if (isLoading) return null;
    if (isAuthenticated && !isOwner) return null;

    const currentPlan = isAuthenticated ? plan.toLowerCase() : undefined;

    const handleSelectPlan = (planType: string, billing: 'monthly' | 'annual') => {
        if (planType !== 'plus' && planType !== 'pro') return;
        changePlan({ plan: planType, billing });
    };

    return (
        <div className='mt-20 flex flex-col items-center'>
            {!isAuthenticated && (
                <p className="text-4xl font-bold text-balance text-center">
                    {t('pricing-title-1')} <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{t('pricing-title-2')}</span> {t('pricing-title-3')}
                </p>
            )}
            <div className="mt-16 w-full">
                <PricingSection currentPlan={currentPlan} onSelectPlan={isAuthenticated && isOwner ? handleSelectPlan : undefined} />
            </div>
            <PricingComparisonTable />
            {!isAuthenticated && <LandingFooter />}
        </div>
    );
}

export default PricingView;
