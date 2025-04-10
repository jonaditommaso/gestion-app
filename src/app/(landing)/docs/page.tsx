import { getCurrent } from '@/features/auth/queries';
import CustomWave from '@/features/landing/components/CustomWave';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { redirect } from 'next/navigation';

const DocsView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing')

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen mt-[-1px]' style={{ backgroundImage: 'linear-gradient(350deg, red 30%, #4d6dbb 90%)' }}>
            <div className="flex gap-10 w-[80%] justify-around mt-20 p-2">

            <Image width={500} height={500} alt='gestionate image' src={'/gestionate-docs.png'} />
            <div className="flex w-full max-w-sm items-center space-x-2 text-white">
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className='text-4xl font-bold text-balance'>Gestionate</p>
                    <p className='text-balance font-normal'>{t("navbar-gestionate")}</p>
                </div>
            </div>


            </div>

            <CustomWave />

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='introduction' className='text-4xl font-bold text-balance'>{t("docs-intro-title")}</p>
                    <p><span className='font-semibold'>Gestionate</span> {t("docs-intro-description")}</p>
                </div>
                <Image width={400} height={400} alt='introduction image' src={'/introduction.svg'} />
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <Image width={400} height={400} alt='how it works image' src={'/how-does-it-work.svg'} />

                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='how-it-works' className='text-4xl font-bold text-balance'>{t("docs-how-it-works-title")}</p>
                    <p>{t("docs-how-it-works-description")}</p>
                </div>
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='customize' className='text-4xl font-bold text-balance'>{t("docs-now-what-title")}</p>
                    <p>{t("docs-now-what-description-1")} <span className='font-semibold'>Gestionate</span> {t("docs-now-what-description-2")}</p>
                </div>
                <Image width={400} height={400} alt='customize image' src={'/custom.svg'} />
            </div>

            <LandingFooter />

        </div>
    );
}

export default DocsView;