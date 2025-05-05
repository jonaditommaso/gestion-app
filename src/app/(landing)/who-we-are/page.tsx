import { getCurrent } from '@/features/auth/queries';
import CustomWave from '@/features/landing/components/CustomWave';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { redirect } from 'next/navigation';

const WhoWeAreView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing')

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen mt-[-1px]' style={{ backgroundImage: 'linear-gradient(350deg, red 30%, #4d6dbb 90%)' }}>
            <div className="flex gap-14 w-[90%] justify-around mt-20 p-8 max-sm:flex-col">
                <Image width={400} height={400} alt='who we are image' src={'/who-we-are-2.svg'} />
                <div className="flex w-full max-w-sm items-center space-x-2 text-white">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className='text-4xl font-bold text-balance'>{t('who-we-are-title')}</p>
                        <p className='text-balance font-normal'>{t('who-we-are-description')}</p>
                    </div>
                </div>
            </div>

            <CustomWave />

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10 max-sm:flex-col'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4 max-sm:w-[100%] max-sm:p-0 max-sm:mb-2'>
                    <p><span className='font-semibold'>Gestionate</span> {t('who-we-are-1')}</p>
                    <p>{t('who-we-are-2')} <span className='font-semibold'>Gestionate</span> {t('who-we-are-3')}</p>
                    <p>{t('who-we-are-4')}</p>
                </div>
                <Image width={400} height={400} alt='who we are image / develop team' src={'/who-we-are-1.svg'} />
            </div>

            <LandingFooter />

        </div>
    );
}

export default WhoWeAreView;