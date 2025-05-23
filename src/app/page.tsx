import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/queries";
import Image from "next/image";
import CustomWave from "@/features/landing/components/CustomWave";
import ServicesCard from "@/features/landing/components/ServicesCard";
import { services } from "@/features/landing/services";
import { quickPlans } from "@/features/landing/quickPlans";
import QuickPlansCard from "@/features/landing/components/QuickPlansCard";
import { takeALook } from "@/features/landing/takeALook";
import TakeALookCard from "@/features/landing/components/TakeALookCard";
import ScrollToTop from "@/features/landing/components/ScrollToTop";
import LandingFooter from "@/features/landing/components/LandingFooter";
import Link from "next/link";
import LandingSignUp from "@/features/landing/components/LandingSignUp";
import { getTranslations } from "next-intl/server";
import HomeView from "@/features/home/components/HomeView";
import DemoButton from "@/features/landing/components/DemoButton";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const user = await getCurrent();
  const t = await getTranslations('landing')

  //if(!user) redirect('/login');

  return (
    <div>
      {user
        ? <HomeView />
        : (

        <div className="flex flex-col items-center bg-[#7886C7] " style={{ backgroundImage: 'linear-gradient(10deg, red 40%, #0061a9  90%)' }}>
          <ScrollToTop />
          <div className="flex flex-col items-center text-white">
            <div className="flex flex-col justify-center mt-36 max-sm:mt-24">
              <p className="text-6xl font-bold text-balance text-center whitespace-pre-line tracking-tighter max-sm:text-[28px]">{t('title')}</p>
              <p className="font-semibold mt-5 text-center max-sm:text-xs">{t('subtitle')}</p>
            </div>

            <div className="flex gap-20 w-[75%] justify-start m-auto max-sm:pb-1 max-sm:flex-col max-sm:gap-10">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="flex flex-col items-center gap-2 w-[450px]">
                  <LandingSignUp />
                  <Separator />
                  <DemoButton text={t('button-get-demo-1')} />
                </div>
              </div>

              <Image width={450} height={450} alt='work image' src={'/home-1.svg'} className="ml-[200px] max-sm:ml-0" />
            </div>
          </div>

          <CustomWave />

          <div className="w-full p-10 bg-[#FFF2F2] mt-[-2px]">
            <div className="flex flex-col items-center gap-4 mb-10 max-sm:gap-2">
              <p className="font-bold text-4xl max-sm:text-2xl">{t('we-do')}</p>
              <p className="font-normal text-3xl max-sm:text-base max-sm:text-center">{t('services')}</p>
            </div>

            <div className="w-[75%] m-auto grid gap-4 gap-y-10 grid-cols-[repeat(auto-fill,minmax(400px,1fr))] md:grid-cols-3 justify-items-center max-sm:justify-center max-sm:gap-y-6">
              {services.map((service, index) => (
                <ServicesCard
                  key={index}
                  serviceTitle={service.title}
                  serviceDescription={service.description}
                  serviceIcon={service.icon}
                  serviceIconColor={service.iconColor}
                  serviceCircleColor={service.circleColor}
                  circlePosition={service.circlePosition}
                />
              ))}
            </div>
          </div>

          <CustomWave rotated rectColor='#a11c55' isBottom />
          <div className="w-full mt-[-1px]" style={{ backgroundImage: 'linear-gradient(180deg, #a11c55  30%, #0061a9 80%)' }}>

            <div className="flex flex-col items-center gap-4 mb-10 p-10 text-white max-sm:mb-2">
              <p className="font-bold text-4xl max-sm:text-center max-sm:text-2xl">{t('join-gestionate')}</p>
              <p className="font-normal text-3xl w-[800px] max-sm:w-[300px] text-balance text-center max-sm:text-sm">{t('join-gestionate-description')}</p>
                <Link href='/pricing'>
                  <Button type="button" className="my-5">
                    {t('button-see-prices')}
                  </Button>
                </Link>
              <div className="flex w-full justify-around max-sm:flex-col">
                <div className="flex flex-col gap-2 max-sm:items-center">
                  {quickPlans.map(plan => (
                    <QuickPlansCard
                      key={plan.planTitle}
                      planTitle={plan.planTitle}
                      planDescription={plan.planDescription}
                    />
                  ))}
                </div>
                <Image width={500} height={500} alt='office image' src={'/home-2.svg'} className="mt-5" />
              </div>
            </div>
          </div>

          <CustomWave rectColor="#0061a9" isBottom />

          <div className="w-full flex flex-col items-center gap-4 bg-[#FFF2F2] mt-[-2px] max-sm:gap-2">
            <p className="font-bold text-4xl max-sm:text-2xl">{t('take-a-look')}</p>
            <p className="font-normal text-3xl max-sm:text-base max-sm:text-center">{t('tal-1')} <span className="font-semibold">{t('tal-2')}</span> {t('tal-3')}</p>
          </div>

          <div className="w-full flex justify-center gap-4 p-10 bg-[#FFF2F2] mt-[-1px] max-sm:flex-col max-sm:pb-5 max-sm:items-center">
            {takeALook.map(element => (
              <TakeALookCard
                key={element.altImage}
                image={element.image}
                altImage={element.altImage}
                title={t(element.title)}
              />
            ))}

          </div>

          <div className="flex items-center justify-center w-full bg-[#FFF2F2] max-sm:m-[-2px]">
            <DemoButton text={t('button-get-demo-2')} fit />
          </div>

          <LandingFooter />
        </div>
      )}
    </div>

  );
}