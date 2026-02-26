import PricingSection from '../../../features/landing/components/PricingSection';
import PricingComparisonTable from '../../../features/landing/components/PricingComparisonTable';
import { getTranslations } from 'next-intl/server';
import LandingFooter from '@/features/landing/components/LandingFooter';

const PricingView = async () => {
    const t = await getTranslations('pricing')

    return (
        <div className='mt-20 flex flex-col items-center'>
            <p className="text-4xl font-bold text-balance text-center">
                {t('pricing-title-1')} <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{t('pricing-title-2')}</span> {t('pricing-title-3')}
            </p>
            <div className="mt-16 w-full">
                <PricingSection />
            </div>

            <PricingComparisonTable />

            <LandingFooter />
        </div>
    );
}

export default PricingView;