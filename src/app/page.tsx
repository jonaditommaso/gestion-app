import { getCurrent } from "@/features/auth/queries";
import ServicesCard from "@/features/landing/components/ServicesCard";
import { services } from "@/features/landing/services";
import ScrollToTop from "@/features/landing/components/ScrollToTop";
import LandingFooter from "@/features/landing/components/LandingFooter";
import { getTranslations } from "next-intl/server";
import HomeView from "@/features/home/components/HomeView";
import HeroSection from "@/features/landing/components/HeroSection";
import DiscoverButton from "@/features/landing/components/DiscoverButton";
import Integrations from "@/features/landing/components/Integrations";
import FeatureShowcase from "@/features/landing/components/FeatureShowcase";
import CustomerSuccess from "@/features/landing/components/CustomerSuccess";

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
                        circlePosition={service.circlePosition}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Integrations Section */}
            <div className="relative py-20 px-10 bg-[#FFF2F2]">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-[size:40px_40px]" />
              <div className="absolute top-0 left-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

              <div className="relative max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <DiscoverButton />
                  <div className="flex justify-center lg:justify-end">
                    <Integrations />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FeatureShowcase />

          <CustomerSuccess />

          <LandingFooter />
        </div>
      )}
    </div>
  );
}