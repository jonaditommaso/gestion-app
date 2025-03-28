import { getCurrent } from '@/features/auth/queries';
import CustomWave from '@/features/landing/components/CustomWave';
import LandingFooter from '@/features/landing/components/LandingFooter';
import Image from 'next/image';

import { redirect } from 'next/navigation';

const WhoWeAreView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen mt-[-1px]' style={{ backgroundImage: 'linear-gradient(350deg, red 30%, #4d6dbb 90%)' }}>
            <div className="flex gap-14 w-[90%] justify-around mt-20 p-8">
                <Image width={400} height={400} alt='who we are image' src={'/who-we-are-2.svg'} />
                <div className="flex w-full max-w-sm items-center space-x-2 text-white">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className='text-4xl font-bold text-balance'>Quienes somos</p>
                        <p className='text-balance font-normal'>Descubre el equipo detras de la maquina. Te contamos brevemente nuestra mision y lo que nos motiva a entregarte el mejor servicio</p>
                    </div>
                </div>
            </div>

            <CustomWave />

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p><span className='font-semibold'>Gestionate</span> es la herramienta ideal para administrar todo tu trabajo. La idea nace de la necesidad de unificar todos los sistemas utilizados en nuestro dia a dia.</p>
                    <p>Con <span className='font-semibold'>Gestionate</span> tenes un control total de todo el flujo laboral, y seguimos desarrollando aun mas herramientas para vos. Nuestra mision es que todo aquello que podamos gestionar por vos, lo hagas aqui, con nosotros.</p>
                    <p>Te daremos todas las comodidades posibles, para facilitar tu jornada de trabajo. No vamos a dejar de trabajar por ti.</p>
                </div>
                <Image width={400} height={400} alt='who we are image / develop team' src={'/who-we-are-1.svg'} />
            </div>


            <LandingFooter />

        </div>
    );
}

export default WhoWeAreView;