export type PlanType = 'free' | 'plus' | 'pro' | 'enterprise';

interface Plan {
    type: PlanType;
    description: string;
    textButton: string;
    monthlyPrice: number;
    annualPrice: number;
    includes?: string;
}

export const plans: Plan[] = [
    {
        type: 'free',
        description: 'pricing-free-description',
        textButton: 'pricing-free-button',
        monthlyPrice: 0,
        annualPrice: 0,
    },
    {
        type: 'plus',
        description: 'pricing-plus-description',
        textButton: 'pricing-plus-button',
        monthlyPrice: 12,
        annualPrice: 9,
        includes: 'pricing-plus-includes',
    },
    {
        type: 'pro',
        description: 'pricing-pro-description',
        textButton: 'pricing-pro-button',
        monthlyPrice: 22,
        annualPrice: 18,
        includes: 'pricing-pro-includes',
    },
    {
        type: 'enterprise',
        description: 'pricing-enterprise-description',
        textButton: 'pricing-enterprise-button',
        monthlyPrice: 0,
        annualPrice: 0,
        includes: 'pricing-enterprise-includes',
    },
];