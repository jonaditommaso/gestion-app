'use client'
import { basicBenefits, enterpriseBenefits, proBenefits, proPlusBenefits } from "@/features/landing/benefits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Rocket } from "lucide-react";
import SelectPricingButton from "./SelectPricingButton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PricingCardProps {
    type: 'free' | 'pro' | 'pro-plus' | 'enterprise',
    description: string,
    textButton: string,
    price: number,
    onSelect?: () => void,
    compact?: boolean,
    billing?: 'monthly' | 'annual',
}

const planes_t = {
    free: 'pricing-basic-title',
    pro: 'pricing-pro-title',
    'pro-plus': 'pricing-pro-plus-title',
    enterprise: 'pricing-enterprise-title'
}

const benefits = {
    free: basicBenefits,
    pro: proBenefits,
    'pro-plus': proPlusBenefits,
    enterprise: enterpriseBenefits
}

const PricingCard = ({ type, description, textButton, price, onSelect, compact = false, billing = 'monthly' }: PricingCardProps) => {
    const t = useTranslations('pricing');

    const isFeatured = type === 'pro-plus' || type === 'enterprise';
    const borderColor = type === 'pro-plus' ? 'border-blue-600' : 'border-yellow-400';
    const bgColor = type === 'pro-plus' ? 'bg-blue-50' : 'bg-yellow-50';
    const badgeBg = type === 'pro-plus' ? 'bg-blue-600' : 'bg-yellow-400';
    const badgeLabel = type === 'pro-plus'
        ? t('pricing-most-popular')
        : <span className="flex items-center gap-2">{t('pricing-no-limits')} <Rocket className="size-4" /></span>;

    if (compact) {
        return (
            <Card className={cn(
                'w-full shadow',
                isFeatured
                    ? `border-4 box-border ${borderColor} ${type === 'pro-plus' ? 'bg-blue-600/5' : ''}`
                    : 'border-4 border-transparent'
            )}>
                <CardHeader className={`relative flex items-center justify-center text-center px-5 pt-5 pb-3 ${isFeatured ? 'mt-[-8px]' : ''}`}>
                    {isFeatured && (
                        <p className={`absolute m-0 mt-[8px] top-0 ${badgeBg} text-white px-4 p-0 rounded-b-lg text-xs`}>
                            {badgeLabel}
                        </p>
                    )}
                    <CardTitle className="text-xl">
                        {t(planes_t[type])}
                    </CardTitle>
                    <p className="text-zinc-500 text-xs">{t(description)}</p>
                    <div className="flex items-center py-2">
                        <span className="text-lg">us$</span>
                        <div className="flex gap-2 items-center">
                            <p className="text-4xl">{price}</p>
                            {type !== 'free' && <p className="text-zinc-500 text-xs">{billing === 'annual' ? t('pricing-billed-annually') : t('pricing-monthly')}</p>}
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="px-5 py-3">
                    <ul>
                        {benefits[type].map((benefit, index) => (
                            <Collapsible className='my-2 group/collapsible' key={index}>
                                <CollapsibleTrigger className="flex items-center text-xs font-semibold text-zinc-600">
                                    <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90"/> {t(benefit.triggerText)}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pl-5 text-zinc-500 text-xs">
                                    {t(benefit.contentText)}
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('w-full md:w-[360px] shadow', isFeatured ? `border-4 box-border ${borderColor} ${bgColor}` : '')}>
            <CardHeader className={`relative flex items-center justify-center text-center p-7 ${isFeatured ? 'mt-[-8px]' : ''}`}>
                {isFeatured && (
                    <p className={`absolute m-0 mt-[8px] top-0 ${badgeBg} text-white px-4 p-0 rounded-b-lg`}>
                        {badgeLabel}
                    </p>
                )}
                <CardTitle className="text-2xl">
                    {t(planes_t[type])}
                </CardTitle>
                <p className="text-zinc-500 h-14">{t(description)}</p>
                <div className="flex items-center py-5">
                    <span className="text-2xl">us$</span>
                    <div className="flex gap-2 items-center">
                        <p className="text-6xl">{price}</p>
                        {type !== 'free' && <p className="text-zinc-500">{billing === 'annual' ? t('pricing-billed-annually') : t('pricing-monthly')}</p>}
                    </div>
                </div>
                {onSelect
                    ? <Button className="w-full" onClick={onSelect}>{textButton}</Button>
                    : <SelectPricingButton textButton={t(textButton)} type={type} billing={billing} />
                }
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
