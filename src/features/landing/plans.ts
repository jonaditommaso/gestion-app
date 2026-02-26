{/* cambiar descripciones */ }
type PlanType = 'free' | 'pro' | 'pro-plus' | 'enterprise';

interface Plan {
    type: PlanType;
    description: string,
    textButton: string,
    monthlyPrice: number,
    annualPrice: number,
}

export const plans: Plan[] = [
    {
        type: 'free',
        description: 'pricing-basic-description',
        textButton: 'pricing-basic-button',
        monthlyPrice: 0,
        annualPrice: 0
    },
    {
        type: 'pro',
        description: 'pricing-pro-description',
        textButton: 'pricing-pro-button',
        monthlyPrice: 49,
        annualPrice: 469
    },
    {
        type: 'pro-plus',
        description: 'pricing-pro-plus-description',
        textButton: 'pricing-pro-plus-button',
        monthlyPrice: 99,
        annualPrice: 949
    },
    {
        type: 'enterprise',
        description: 'pricing-enterprise-description',
        textButton: 'pricing-enterprise-button',
        monthlyPrice: 149,
        annualPrice: 1499
    }
];