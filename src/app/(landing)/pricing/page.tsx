import { getCurrent } from '@/features/auth/queries';
import PricingCard from '../../../features/landing/components/PricingCard';
import { plans } from '../../../features/landing/plans';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

const PricingView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('pricing')

    if(user) redirect('/');

    return (
        <div className='mt-20 flex flex-col items-center'>
            <p className="text-4xl font-bold text-balance text-center">
                {t('pricing-title-1')} <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{t('pricing-title-2')}</span> {t('pricing-title-3')}
            </p>
            <div className="container flex gap-3 mt-16 justify-center p-1 max-sm:flex-col">
                {plans.map(plan => (
                    <PricingCard
                        key={plan.type}
                        type={plan.type}
                        description={plan.description}
                        textButton={plan.textButton}
                        price={plan.price}
                        featured={plan.type === 'enterprise' || plan.type === 'pro'}
                    />
                ))}
            </div>
        </div>
    );
}

export default PricingView;