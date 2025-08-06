import { getCurrent } from "@/features/auth/queries";
import Image from "next/image";
import ServicesCard from "@/features/landing/components/ServicesCard";
import { services } from "@/features/landing/services";
import ScrollToTop from "@/features/landing/components/ScrollToTop";
import LandingFooter from "@/features/landing/components/LandingFooter";
import { getTranslations } from "next-intl/server";
import HomeView from "@/features/home/components/HomeView";
import { Separator } from "@/components/ui/separator";
import { FcAddDatabase, FcBullish, FcParallelTasks } from "react-icons/fc";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faq } from "@/features/landing/faq";
import FadeInUp from "@/animations/FadeInUp";
import HeroSection from "@/features/landing/components/HeroSection";
import DiscoverButton from "@/features/landing/components/DiscoverButton";
import Integrations from "@/features/landing/components/Integrations";

export default async function Home() {
  const user = await getCurrent();
  const t = await getTranslations('landing')

  //if(!user) redirect('/login');

  return (
    <div>
      {user
        ? <HomeView />
        : (

        <div className="flex flex-col items-center">
          <ScrollToTop />

          <HeroSection />

          <div className="w-full py-10 bg-[#FFF2F2] mt-[-2px]">
            <div className="flex flex-col items-center gap-4 mb-10 max-sm:gap-2">
              <p className="font-bold text-4xl max-sm:text-2xl">{t('we-do')}</p>
              <p className="font-normal text-3xl max-sm:text-base max-sm:text-center">{t('services')}</p>
            </div>

            <div className="relative w-full overflow-hidden">
              {/* Fades laterales */}
              <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10" />

              {/* Carrusel animado */}
              <div className="group relative overflow-hidden">
                <div className="flex gap-6 w-max animate-scroll group-hover:[animation-play-state:paused]">
                  {services.concat(services).map((service, index) => (
                    <div key={index} className="min-w-[300px] flex-shrink-0">
                      <ServicesCard key={index}
                        serviceTitle={service.title}
                        serviceDescription={service.description}
                        serviceIcon={service.icon}
                        serviceIconColor={service.iconColor}
                        serviceCircleColor={service.circleColor}
                        circlePosition={service.circlePosition} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex my-20 mx-10 justify-evenly items-center gap-10">
              <DiscoverButton />

              <Integrations />
            </div>
          </div>

          <div className="flex flex-col items-center text-white w-full py-20 text-center gap-10" style={{ backgroundImage: 'linear-gradient(0deg, #171321 40%, #11314a  90%)' }}>
            <FadeInUp>
              <div className="flex flex-col items-center gap-4 mb-14">
                <FcParallelTasks className="w-14 h-14 mb-3" />
                <p className="text-4xl font-semibold text-balance tracking-tighter max-w-80 m-auto">Trabajar en equipo nunca fue tan facil</p>
                <p className="text-lg font-semibold max-w-[650px]">Administra todas las tareas del equipo de forma sencilla y eficiente. Concentramos todos los recursos en un solo lugar.</p>
                <div className="grid grid-cols-2 gap-20 items-center">
                  <Accordion type="single" collapsible className="m-auto mt-5 flex flex-col gap-4 mb-5 max-sm:px-2">
                    {faq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className='px-2 w-[600px]'>
                        <AccordionTrigger className="hover:no-underline text-white text-lg [&>svg]:text-[#4d6dbb] [&>svg]:w-6 [&>svg]:h-6 max-sm:text-sm">
                            {t(item.question)}
                        </AccordionTrigger>
                        <AccordionContent>
                            {t(item.answer)}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                <Image width={700} height={700} alt={'home'} src={'/present-workspaces.png'} className="border rounded-md" />
                </div>
              </div>
              <Separator className="bg-[#eee]/15" />
            </FadeInUp>

            <FadeInUp>
              <div className="flex flex-col items-center gap-4 mb-14">
                <FcAddDatabase className="w-14 h-14 mb-3" />
                <p className="text-4xl font-semibold text-balance tracking-tighter max-w-96 m-auto">Guarda tus archivos en la nube</p>
                <p className="text-lg font-semibold max-w-[650px]">Carga tus registros, documentos y archivos importantes de forma segura y accede a ellos desde cualquier lugar.</p>
                <div className="grid grid-cols-2 gap-20 items-center">
                  <Accordion type="single" collapsible className="m-auto mt-5 flex flex-col gap-4 mb-5 max-sm:px-2 order-2">
                    {faq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className='px-2 w-[600px]'>
                        <AccordionTrigger className="hover:no-underline text-white text-lg [&>svg]:text-[#4d6dbb] [&>svg]:w-6 [&>svg]:h-6 max-sm:text-sm">
                            {t(item.question)}
                        </AccordionTrigger>
                        <AccordionContent>
                            {t(item.answer)}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                <Image width={700} height={700} alt={'home'} src={'/present-workspaces.png'} className="border rounded-md order-1" />
                </div>
              </div>
              <Separator className="bg-[#eee]/15" />
            </FadeInUp>


            <FadeInUp>
              <div className="flex flex-col items-center gap-4 mb-14">
                <FcBullish className="w-14 h-14 mb-3" />
                <p className="text-4xl font-semibold text-balance tracking-tighter max-w-80 m-auto">Tu portal operativo tambien aqui.</p>
                <p className="text-lg font-semibold max-w-[650px]">Carga tus ingresos y egresos, y accede a reportes financieros en tiempo real. Gestiona la presencialidad, la nomina y mucho mas.</p>
                <div className="grid grid-cols-2 gap-20 items-center">
                  <Accordion type="single" collapsible className="m-auto mt-5 flex flex-col gap-4 mb-5 max-sm:px-2 ">
                    {faq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className='px-2 w-[600px]'>
                        <AccordionTrigger className="hover:no-underline text-white text-lg [&>svg]:text-[#4d6dbb] [&>svg]:w-6 [&>svg]:h-6 max-sm:text-sm">
                            {t(item.question)}
                        </AccordionTrigger>
                        <AccordionContent>
                            {t(item.answer)}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                <Image width={700} height={700} alt={'home'} src={'/present-workspaces.png'} className="border rounded-md" />
                </div>
              </div>
            </FadeInUp>
          </div>

          <LandingFooter />
        </div>
      )}
    </div>
  );
}