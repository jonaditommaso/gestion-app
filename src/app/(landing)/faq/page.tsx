import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getCurrent } from '@/features/auth/queries';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { faq } from '@/features/landing/faq';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function FaqPage() {
    const user = await getCurrent();
    const t = await getTranslations('landing');

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen'>
            {/* Hero Section */}
            <div
                className="flex flex-col items-center text-white bg-[#11314a] w-full py-32"
                style={{ backgroundImage: "linear-gradient(10deg, #11314a 40%, black 90%)" }}
            >
                <div className="flex flex-col items-center gap-8 text-center max-w-4xl px-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                        </div>
                        <span className="text-blue-300 font-medium">FAQ</span>
                    </div>
                    <h1 className='text-7xl font-bold text-balance bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent max-sm:text-5xl leading-tight'>
                        {t('faq-title')}
                    </h1>
                    <p className='text-2xl font-normal text-balance opacity-90 max-sm:text-xl max-w-3xl leading-relaxed'>
                        {t('faq-description')}
                    </p>
                </div>
            </div>

            {/* FAQ Content */}
            <div className='bg-gradient-to-br from-slate-50 to-blue-50 w-full flex-grow py-16'>
                <div className="max-w-4xl mx-auto px-6">
                    <Accordion type="single" collapsible className="flex flex-col gap-4">
                        {faq.map((item, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className='border-0 shadow-md rounded-xl bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300'
                            >
                                <AccordionTrigger className="hover:no-underline text-slate-800 text-lg font-semibold px-6 py-4 [&>svg]:text-blue-600 [&>svg]:w-5 [&>svg]:h-5 max-sm:text-base hover:text-blue-700 transition-colors">
                                    {t(item.question)}
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4 text-slate-600 leading-relaxed">
                                    {t(item.answer)}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}