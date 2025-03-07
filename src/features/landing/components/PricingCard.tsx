import { basicBenefits, enterpriseBenefits, proBenefits } from "@/features/landing/benefits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

interface PricingCardProps {
    type: 'basic' | 'pro' | 'enterprise',
    description: string,
    textButton: string, //Únete gratis
    price: number,
    featured?: boolean
}

const planes_t = {
    basic: 'Básico',
    pro: 'Pro',
    enterprise: 'Empresa'
}

const benefits = {
    basic: basicBenefits,
    pro: proBenefits,
    enterprise: enterpriseBenefits
}

const PricingCard = ({ type, description, textButton, price, featured }: PricingCardProps) => {
    return (
        <Card className={`w-full md:w-[400px] shadow ${featured ? 'border-4 border-blue-600 box-border' : ''}`}>
            <CardHeader className={`relative flex items-center justify-center text-center p-7 ${featured ? 'mt-[-8px]' : ''}`}>
                {featured && <p className="absolute m-0 mt-[8px] top-0 bg-blue-600 text-white px-4 p-0 rounded-b-lg">
                    El más popular
                </p>}
                <CardTitle className="text-2xl">
                    {planes_t[type]}  {/* {type} */}
                </CardTitle>
                <p className="text-zinc-500">{description}</p>
                <div className="flex items-center py-5">
                    <span className="text-2xl">us$</span>
                    <div className="flex gap-2 items-center">
                        <p className="text-6xl">{price}</p>
                        {type !== 'basic' && <p className="text-zinc-500">anual</p>}
                    </div>
                </div>
                <Button variant='outline' className="p-2 w-full bg-zinc-900 hover:bg-zinc-800 hover:text-white text-white font-semibold">{textButton}</Button>
            </CardHeader>
            <Separator />
            <CardContent className="p-7">
                <ul>
                    {benefits[type].map((benefit, index) => (
                        <Collapsible className='m-4 group/collapsible' key={index}>
                            <CollapsibleTrigger className="flex items-center font-semibold text-zinc-600">
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"/> {benefit.triggerText}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 text-zinc-500 text-sm">
                                {benefit.contentText}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default PricingCard;
