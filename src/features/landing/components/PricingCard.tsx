'use client'
import { freeBenefits, enterpriseBenefits, proBenefits, plusBenefits } from "@/features/landing/benefits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Rocket } from "lucide-react";
import SelectPricingButton from "./SelectPricingButton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PricingCardProps {
    type: 'free' | 'plus' | 'pro' | 'enterprise',
    description: string,
    textButton: string,
    price: number,
    onSelect?: () => void,
    compact?: boolean,
    billing?: 'monthly' | 'annual',
    userCount?: number,
    includes?: string,
}

const planes_t = {
    free: 'Free',
    plus: 'Plus',
    pro: 'Pro',
    enterprise: 'Enterprise',
}

const benefits = {
    free: freeBenefits,
    plus: plusBenefits,
    pro: proBenefits,
    enterprise: enterpriseBenefits
}

const PricingCard = ({ type, description, textButton, price, onSelect, compact = false, billing = 'monthly', userCount, includes }: PricingCardProps) => {
    const t = useTranslations('pricing');

    const isFeatured = type === 'pro' || type === 'enterprise';
    const borderColor = type === 'pro' ? 'border-blue-500' : 'border-yellow-400';
    const bgColor = type === 'pro'
        ? 'bg-gradient-to-br from-blue-100 via-white to-indigo-50/60'
        : 'bg-gradient-to-br from-yellow-100 via-white to-amber-50/60';
    const featuredShadow = type === 'pro'
        ? 'shadow-xl shadow-blue-200/60'
        : 'shadow-xl shadow-yellow-200/60';
    const badgeBg = type === 'pro' ? 'bg-blue-600' : 'bg-yellow-400';
    const badgeLabel = type === 'pro'
        ? t('pricing-most-popular')
        : <span className="flex items-center gap-2">{t('pricing-no-limits')} <Rocket className="size-4" /></span>;

    const perUserLabel = billing === 'annual' ? t('pricing-per-user-year') : t('pricing-per-user-month');
    const showTotal = type !== 'free' && type !== 'enterprise' && userCount !== undefined && userCount > 0;
    const total = showTotal ? price * userCount! : 0;

    const priceBlock = () => {
        if (type === 'enterprise') {
            return (
                <p className={cn('text-sm text-zinc-500 leading-relaxed text-center font-semibold', compact ? 'py-3' : 'py-5')}>
                    {t('pricing-price-on-request')}
                </p>
            );
        }
        return (
            <div className={cn('flex flex-col items-center gap-1 text-center', compact && 'py-2')}>
                <div className="flex items-end">
                    <span className={compact ? 'text-base' : 'text-2xl'}>us$</span>
                    <p className={cn('tabular-nums font-bold', compact ? 'text-4xl' : 'text-6xl leading-none')}>{price}</p>
                </div>
                {type !== 'free' && (
                    <p className="text-zinc-500 text-xs">{perUserLabel}</p>
                )}
                {showTotal && !compact && (
                    <p className="text-zinc-500 text-sm mt-1 tabular-nums">
                        {t('pricing-total-monthly')}:{' '}
                        <span className="font-semibold text-foreground">us$ {total}</span>
                    </p>
                )}
            </div>
        );
    };

    if (compact) {
        return (
            <Card className={cn(
                'w-full',
                isFeatured
                    ? `border-4 box-border ${borderColor} ${bgColor} ${featuredShadow}`
                    : 'border shadow-md bg-gradient-to-br from-zinc-100 via-white to-slate-50/80'
            )}>
                <CardHeader className={`relative flex items-center justify-center text-center px-5 pt-5 pb-3 ${isFeatured ? 'mt-[-8px]' : ''}`}>
                    {isFeatured && (
                        <p className={`absolute m-0 mt-[8px] top-0 ${badgeBg} text-white px-4 p-0 rounded-b-lg text-xs`}>
                            {badgeLabel}
                        </p>
                    )}
                    <CardTitle className="text-xl">
                        {planes_t[type]}
                    </CardTitle>
                    <p className="text-zinc-500 text-xs">{t(description)}</p>
                    {priceBlock()}
                </CardHeader>
                <Separator />
                <CardContent className="px-5 py-3">
                    {includes && (
                        <p className="text-xs text-muted-foreground font-medium mb-2 px-1">{t(includes)}</p>
                    )}
                    <ul>
                        {benefits[type].map((benefit, index) => (
                            <Collapsible className='my-2 group/collapsible' key={index}>
                            <CollapsibleTrigger className="flex items-start gap-1 text-xs font-semibold text-zinc-500 text-left w-full">
                                    <ChevronRight className="shrink-0 mt-0.5 size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                                    <span>{t(benefit.triggerText)}</span>
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
        <Card className={cn('w-full md:w-[360px] flex flex-col', isFeatured ? `border-4 box-border ${borderColor} ${bgColor} ${featuredShadow}` : 'shadow-md border bg-gradient-to-br from-zinc-100 via-white to-slate-50/80')}>
            <CardHeader className={`relative flex flex-col items-center text-center p-7 ${isFeatured ? 'mt-[-8px]' : ''}`}>
                {isFeatured && (
                    <p className={`absolute m-0 mt-[8px] top-0 ${badgeBg} text-white px-4 p-0 rounded-b-lg`}>
                        {badgeLabel}
                    </p>
                )}
                <CardTitle className="text-2xl">
                    {planes_t[type]}
                </CardTitle>
                <p className="text-zinc-500 h-14">{t(description)}</p>
                <div className="w-full h-[148px] flex flex-col justify-center items-center">
                    {priceBlock()}
                </div>
                {onSelect
                    ? <Button className="w-full" onClick={onSelect}>{textButton}</Button>
                    : <SelectPricingButton textButton={t(textButton)} type={type} billing={billing} />
                }
            </CardHeader>
            <Separator />
            <CardContent className="p-7">
                {includes && (
                    <p className="text-sm text-muted-foreground font-medium mb-3">{t(includes)}</p>
                )}
                <ul>
                    {benefits[type].map((benefit, index) => (
                        <Collapsible className='m-4 group/collapsible' key={index}>
                            <CollapsibleTrigger className="flex items-end gap-1.5 font-semibold text-zinc-500 text-left w-full">
                                <ChevronRight className="shrink-0 mt-0.5 transition-transform group-data-[state=open]/collapsible:rotate-90 stroke-1"/>
                                <span>{t(benefit.triggerText)}</span>
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
