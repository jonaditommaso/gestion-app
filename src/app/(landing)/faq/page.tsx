import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getCurrent } from '@/features/auth/queries';
import CustomWave from '@/features/landing/components/CustomWave';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { faq } from '@/features/landing/faq';
import Image from 'next/image';

import { redirect } from 'next/navigation';

const FaqView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen mt-[-1px]' style={{ backgroundImage: 'linear-gradient(350deg, red 30%, #4d6dbb 90%)' }}>
            <div className="flex gap-14 w-[90%] justify-around mt-20 p-2">

            <Image width={400} height={400} alt='faq image' src={'/faq.svg'} />
            <div className="flex w-full max-w-sm items-center space-x-2 text-white">
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className='text-4xl font-bold text-balance'>Las preguntas mas frecuentes</p>
                    <p className='text-balance font-normal'>Tienes aun mas curiosidad sobre como funciona Gestionate? Probablemente la respuesta la encuentres aqui</p>
                </div>
            </div>


            </div>

            <CustomWave />

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex-grow'>
                <Accordion type="single" collapsible className="w-[60%] m-auto mt-5 flex flex-col gap-4 mb-5">
                    {faq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className='shadow-lg rounded-lg px-2 bg-white'>
                        <AccordionTrigger className="hover:no-underline text-[#9a3e6a] text-lg [&>svg]:text-[#4d6dbb] [&>svg]:w-6 [&>svg]:h-6 ">
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <LandingFooter />

        </div>
    );
}

export default FaqView;