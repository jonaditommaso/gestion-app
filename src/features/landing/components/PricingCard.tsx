'use client'
import { basicBenefits, enterpriseBenefits, proBenefits, proPlusBenefits } from "@/features/landing/benefits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Rocket } from "lucide-react";
import SelectPricingButton from "./SelectPricingButton";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PricingCardProps {
    type: 'free' | 'pro' | 'enterprise',
    description: string,
    textButton: string, //Únete gratis
    price: number | { normal: number, plus: number },
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
    proPlus: proPlusBenefits,
    enterprise: enterpriseBenefits
}

const PricingCard = ({ type, description, textButton, price, featured }: PricingCardProps) => {
    const [proPlusChecked, setProPlusChecked] = useState(false);
    const t = useTranslations('pricing');

    const getPrice = () => {
        if (typeof price === 'number') return price;
        return proPlusChecked ? price.plus : price.normal;
    }

    return (
        <Card className={cn('w-full md:w-[400px] shadow', featured ? 'border-4 box-border' : '', featured && type === 'pro' ? 'border-blue-600' : '', featured && type === 'enterprise' ? 'border-yellow-400' : '')}>
            <CardHeader className={`relative flex items-center justify-center text-center p-7 ${featured ? 'mt-[-8px]' : ''}`}>
                {featured && <p className={`absolute m-0 mt-[8px] top-0 ${type === 'pro' ? 'bg-blue-600' : 'bg-yellow-400'} text-white px-4 p-0 rounded-b-lg`}>
                    {type === 'pro' ? t('pricing-most-popular') : <span className="flex items-center gap-2">{t('pricing-no-limits')} <Rocket className="size-4" /></span>}
                </p>}
                <CardTitle className="text-2xl flex items-center relative">
                    {t(planes_t[type])}  {/* {type} */}
                    {type === 'pro' && (
                        <span className="absolute left-full ml-16 text-sm flex items-center text-muted-foreground">
                            <Checkbox
                                className="border-muted-foreground rounded-sm mr-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                checked={proPlusChecked}
                                onCheckedChange={value => setProPlusChecked(!!value)}
                            />
                            <span className={proPlusChecked ? 'text-blue-600' : ''}>Plus+</span>
                        </span>
                    )}
                </CardTitle>
                <p className="text-zinc-500">{t(description)}</p>
                <div className="flex items-center py-5">
                    <span className="text-2xl">us$</span>
                    <div className="flex gap-2 items-center">
                        <p className="text-6xl">{getPrice()}</p>
                        {type !== 'free' && <p className="text-zinc-500">{t('pricing-monthly')}</p>}
                    </div>
                </div>
                <SelectPricingButton textButton={t(textButton)} type={type} isProChecked={proPlusChecked} />
            </CardHeader>
            <Separator />
            <CardContent className="p-7">
                <ul>
                    {benefits[(type === 'pro' && proPlusChecked) ? 'proPlus' : type].map((benefit, index) => (
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
