{/* cambiar descripciones */}
type PlanType = 'free' | 'pro' | 'enterprise'; // basic changed to free

interface Plan {
  type: PlanType;
  description: string,
  textButton: string,
  price: number | { normal: number, plus: number }
}

export const plans: Plan[] = [
    {
        type: 'free',
        description: 'pricing-basic-description',
        textButton: 'pricing-basic-button',
        price: 0
    },
    {
        type: 'pro',
        description: 'pricing-pro-description',
        textButton: 'pricing-pro-button',
        price: {
            normal: 49,
            plus: 99
        }
    },
    {
        type: 'enterprise',
        description: 'pricing-enterprise-description',
        textButton: 'pricing-enterprise-button',
        price: 150
    }
];