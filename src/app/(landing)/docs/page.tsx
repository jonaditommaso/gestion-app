import { getCurrent } from '@/features/auth/queries';
import CustomWave from '@/features/landing/components/CustomWave';
import LandingFooter from '@/features/landing/components/LandingFooter';
import Image from 'next/image';

import { redirect } from 'next/navigation';

const DocsView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen mt-[-1px]' style={{ backgroundImage: 'linear-gradient(350deg, red 30%, #4d6dbb 90%)' }}>
            <div className="flex gap-10 w-[80%] justify-around mt-20 p-2">

            <Image width={500} height={500} alt='gestionate image' src={'/gestionate-docs.png'} />
            <div className="flex w-full max-w-sm items-center space-x-2 text-white">
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className='text-4xl font-bold text-balance'>Gestionate</p>
                    <p className='text-balance font-normal'>La aplicacion web que te permite gestionar tu empresa de manera mas eficiente. Todo lo que necesitas, en un solo sitio.</p>
                </div>
            </div>


            </div>

            <CustomWave />

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='introduction' className='text-4xl font-bold text-balance'>Introduccion</p>
                    <p><span className='font-semibold'>Gestionate</span> esta aqui para hacer tu trabajo lo mas sencillo posible, unificando en un solo sitio todo lo que necesitas para tener un control real sobre tus tareas, la de todo tu equipo, saber como progresan otros departamentos, que lleves todos tus registros con un facil acceso, edicion y carga. Queremos lograr que tu espacio laboral se expanda en oportunidades, sin tener que usar decenas de aplicaciones o sistemas.</p>
                </div>
                <Image width={400} height={400} alt='introduction image' src={'/introduction.svg'} />
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <Image width={400} height={400} alt='how it works image' src={'/how-does-it-work.svg'} />

                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='how-it-works' className='text-4xl font-bold text-balance'>Como funciona</p>
                    <p>Tu organizacion contara con todas nuestras funcionalidades. Solo debes escoger un plan y comenzar a operar. Podras permitir y denegar accesos a los usuarios que anadas a tu organizacion, y siempre que quieras podras modificar los permisos. Cada accion cuenta con un historial, por lo que todo lo realizado en la aplicacion quedara registrado. Explora todas las comodidades y oportunidades que ofrecen nuestros productos.</p>
                </div>
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='customize' className='text-4xl font-bold text-balance'>Y ahora que?</p>
                    <p>Con <span className='font-semibold'>Gestionate</span> queremos lograr que tu jornada laboral sea lo mas placentera posible, es decir, que ademas de todas las funcionalidades que proveemos, podras personalizarlo, darle ese toque tuyo que te haga sentir comodo en tu dia a dia. La seccion de Inicio es tuya, usa todos los atajos y widgets disponibles. Tambien podras anadir tus notas, esas que solo compartes contigo mismo como reminders. Y ademas podras cambiar fuentes y colores. Aplica tu estilo!</p>
                </div>
                <Image width={400} height={400} alt='customize image' src={'/custom.svg'} />
            </div>

            <LandingFooter />

        </div>
    );
}

export default DocsView;