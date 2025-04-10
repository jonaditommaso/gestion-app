import { basicBenefits, enterpriseBenefits, proBenefits } from "@/features/landing/benefits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import SelectPricingButton from "./SelectPricingButton";
import { getTranslations } from "next-intl/server";

interface PricingCardProps {
    type: 'free' | 'pro' | 'enterprise',
    description: string,
    textButton: string, //Únete gratis
    price: number,
    featured?: boolean
}

const planes_t = {
    free: 'pricing-basic-title',
    pro: 'pricing-pro-title',
    enterprise: 'pricing-enterprise-title'
}

const benefits = {
    free: basicBenefits,
    pro: proBenefits,
    enterprise: enterpriseBenefits
}

const PricingCard = async ({ type, description, textButton, price, featured }: PricingCardProps) => {
    const t = await getTranslations('pricing')

    return (
        <Card className={`w-full md:w-[400px] shadow ${featured ? 'border-4 border-blue-600 box-border' : ''}`}>
            <CardHeader className={`relative flex items-center justify-center text-center p-7 ${featured ? 'mt-[-8px]' : ''}`}>
                {featured && <p className="absolute m-0 mt-[8px] top-0 bg-blue-600 text-white px-4 p-0 rounded-b-lg">
                    {t('pricing-most-popular')}
                </p>}
                <CardTitle className="text-2xl">
                    {t(planes_t[type])}  {/* {type} */}
                </CardTitle>
                <p className="text-zinc-500">{t(description)}</p>
                <div className="flex items-center py-5">
                    <span className="text-2xl">us$</span>
                    <div className="flex gap-2 items-center">
                        <p className="text-6xl">{price}</p>
                        {type !== 'free' && <p className="text-zinc-500">{t('pricing-annual')}</p>}
                    </div>
                </div>
                <SelectPricingButton textButton={t(textButton)} type={type} />
            </CardHeader>
            <Separator />
            <CardContent className="p-7">
                <ul>
                    {benefits[type].map((benefit, index) => (
                        <Collapsible className='m-4 group/collapsible' key={index}>
                            <CollapsibleTrigger className="flex items-center font-semibold text-zinc-600">
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"/> {t(benefit.triggerText)}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 text-zinc-500 text-sm">
                                {t(benefit.contentText)}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default PricingCard;
