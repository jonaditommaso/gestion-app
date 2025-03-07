{/* cambiar descripciones */}
type PlanType = 'basic' | 'pro' | 'enterprise';

interface Plan {
  type: PlanType;
  description: string,
  textButton: string
  price: number
}

export const plans: Plan[] = [
    {
        type: 'basic',
        description: 'Comienza con lo básico',
        textButton: 'Comenzar gratis',
        price: 0
    },
    {
        type: 'pro',
        description: 'Impulsa tu negocio al siguiente nivel',
        textButton: 'Comenzar',
        price: 150
    },
    {
        type: 'enterprise',
        description: 'Aprovecha el máximo potencial',
        textButton: 'Contacta con Ventas',
        price: 220
    }
];