import { getCurrent } from '@/features/auth/queries';
import CustomWave from '@/features/landing/components/CustomWave';
import LandingFooter from '@/features/landing/components/LandingFooter';
import Image from 'next/image';

import { redirect } from 'next/navigation';

const ProductsView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div className='flex flex-col items-center min-h-screen mt-[-1px]' style={{ backgroundImage: 'linear-gradient(350deg, red 30%, #4d6dbb 90%)' }}>
            <div className="flex gap-10 w-[80%] justify-around mt-20 p-2">

            <Image width={600} height={600} alt='products image' src={'/products-1.svg'} />
            <div className="flex w-full max-w-sm items-center space-x-2 text-white">
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className='text-4xl font-bold text-balance'>Productos</p>
                    <p className='text-balance font-normal'>Mira todo lo que podemos ofrecerte</p>
                </div>
            </div>


            </div>

            <CustomWave />

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='workspaces' className='text-4xl font-bold text-balance'>Workspaces</p>
                    <p>G-Workspace provee un sistema para llevar un control sobre las actividades de tu equipo. Crea tus tareas y gestionalo con un tablero Kanban, visualizalas tambien en tablas o con una vista de calendario.</p>
                </div>
                <Image width={400} height={400} alt='introduction image' src={'/introduction.svg'} />
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <Image width={400} height={400} alt='how it works image' src={'/how-does-it-work.svg'} />

                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='billing' className='text-4xl font-bold text-balance'>Billing</p>
                    <p>G-Billing te permite cargar tus ingresos y egresos, para visualizar de manera clara y directa el resumen de tus cuentas. Aniade los graficos que mejor se adecuen a tu sistema de gestion.</p>
                </div>
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='registers' className='text-4xl font-bold text-balance'>Registros</p>
                    <p>Carga tus registros de clientes, potenciales clientes, proveedores, afiliados, o el listado que tu quieras y necesites. Podras subir tu archivo excel para varios registros y tambien podras cargarlos manualmente. Tienes diferentes tablas a tu total disposicion.</p>
                </div>
                <Image width={400} height={400} alt='customize image' src={'/custom.svg'} />
            </div>

            <div className='bg-[#FFF2F2] w-full mt-[-2px] flex flex-grow justify-center p-10'>
                <Image width={400} height={400} alt='customize image' src={'/custom.svg'} />
                <div className='w-[50%] p-4 text-2xl text-balance flex flex-col text-center gap-4'>
                    <p id='inventory' className='text-4xl font-bold text-balance'>Inventory</p>
                    <p>Con G-Inventory llevaras un control eficiente de tu inventario. Carga facilmente las entradas, salidas y gestiona tu stock. Te proveemos multiples herramientas de facil usabilidad. Veras que llevar un control de inventario nunca fue tan sencillo.</p>
                </div>
            </div>

            <LandingFooter />

        </div>
    );
}

export default ProductsView;