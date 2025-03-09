import { getCurrent } from '@/features/auth/queries';
import PricingCard from '../../../features/landing/components/PricingCard';
import { plans } from '../../../features/landing/plans';
import { redirect } from 'next/navigation';

const PricingView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div className='mt-20 flex flex-col items-center'>
            <p className="text-4xl font-bold text-balance text-center">Elige el plan perfecto para tu equipo</p>
            <div className="container flex gap-3 mt-16 justify-center p-1">
                {plans.map(plan => (
                    <PricingCard
                        key={plan.type}
                        type={plan.type}
                        description={plan.description}
                        textButton={plan.textButton}
                        price={plan.price}
                        featured={plan.type === 'enterprise'}
                    />
                ))}
            </div>
        </div>
    );
}

export default PricingView;