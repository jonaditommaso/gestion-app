'use client'
import { useState } from "react";
import { plans } from "@/features/landing/plans";
import PricingCard from "./PricingCard";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Billing = 'monthly' | 'annual';

const PricingSection = () => {
    const [billing, setBilling] = useState<Billing>('monthly');
    const t = useTranslations('pricing');

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
                <button
                    type="button"
                    onClick={() => setBilling('monthly')}
                    className={cn(
                        'px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200',
                        billing === 'monthly'
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {t('pricing-monthly')}
                </button>
                <button
                    type="button"
                    onClick={() => setBilling('annual')}
                    className={cn(
                        'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200',
                        billing === 'annual'
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {t('pricing-annual')}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold whitespace-nowrap">
                        {t('pricing-annual-save')}
                    </span>
                </button>
            </div>

            <div className="container flex flex-wrap gap-4 justify-center p-1 max-sm:flex-col mb-10">
                {plans.map(plan => (
                    <PricingCard
                        key={plan.type}
                        type={plan.type}
                        description={plan.description}
                        textButton={plan.textButton}
                        price={
                            billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice
                        }
                        billing={billing}
                    />
                ))}
            </div>
        </div>
    );
};

export default PricingSection;
