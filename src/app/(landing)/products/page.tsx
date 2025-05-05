import { getCurrent } from '@/features/auth/queries';
import CustomWave from '@/features/landing/components/CustomWave';
import LandingFooter from '@/features/landing/components/LandingFooter';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { redirect } from 'next/navigation';

const ProductsView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('landing')

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen mt-[-1px]' style={{ backgroundImage: 'linear-gradient(350deg, red 30%, #4d6dbb 90%)' }}>
            <div className="flex gap-10 w-[80%] justify-around mt-20 p-2 max-sm:flex-col">
                <Image width={600} height={600} alt='products image' src={'/products-1.svg'} />
                <div className="flex w-full max-w-sm items-center space-x-2 text-white">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className='text-4xl font-bold text-balance'>{t('navbar-products')}</p>
                        <p className='text-balance font-normal'>{t('products-title')}</p>
                    </div>
                </div>
            </div>

            <CustomWave />

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10 max-sm:flex-col'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4 max-sm:w-[100%]'>
                    <p id='workspaces' className='text-4xl font-bold text-balance'>{t('products-workspaces-title')}</p>
                    <p>{t('products-workspaces-description')}</p>
                </div>
                <Image width={400} height={400} alt='introduction image' src={'/introduction.svg'} />
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10 max-sm:flex-col-reverse'>
                <Image width={400} height={400} alt='how it works image' src={'/how-does-it-work.svg'} />

                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4 max-sm:w-[100%]'>
                    <p id='billing' className='text-4xl font-bold text-balance'>{t('facturation')}</p>
                    <p>{t('products-billing-description')}</p>
                </div>
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10 max-sm:flex-col'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4 max-sm:w-[100%]'>
                    <p id='registers' className='text-4xl font-bold text-balance'>{t('records')}</p>
                    <p>{t('products-records-description')}</p>
                </div>
                <Image width={400} height={400} alt='customize image' src={'/custom.svg'} />
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10 max-sm:flex-col-reverse'>
                <Image width={400} height={400} alt='customize image' src={'/custom.svg'} />
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4 max-sm:w-[100%]'>
                    <p id='inventory' className='text-4xl font-bold text-balance'>{t('products-innventory-title')}</p>
                    <p>{t('products-innventory-description')}</p>
                </div>
            </div>

            <LandingFooter />

        </div>
    );
}

export default ProductsView;