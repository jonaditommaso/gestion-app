import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrent } from "@/features/auth/queries";
import Image from "next/image";
import { CalendarDemo } from "@/features/home/components/Calendar";
import { CardNotes } from "@/features/home/components/CardNotes";
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
// import UserButton from "@/features/auth/components/UserButton";
// import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
// import { redirect } from "next/navigation";
// import AppNavbar from "../components/AppNavbar";
// import AppSidebar from "../components/AppSidebar";

export default async function Home() {
  const user = await getCurrent();

  //if(!user) redirect('/login');

  return (
    <div>
      {user
        ? <div className="ml-[var(--sidebar-width)] flex justify-center mt-24 gap-10">
          <CardNotes />
          <CardNotes />
          <CalendarDemo />
        </div>
        : (

        <div className="flex flex-col items-center bg-[#7886C7] " style={{ backgroundImage: 'linear-gradient(10deg, red 30%, #4d6dbb 90%)' }}>
          <ScrollToTop />
          <div className="flex flex-col items-center text-white">
            <div className=" flex flex-col justify-center mt-24 max-w-[700px]">
              <p className="text-6xl font-bold text-balance text-center">Gestiona y organiza todo tu trabajo en un solo lugar</p>
              <p className="font-semibold mt-5 text-center">Facilidad para tu equipo, resultados para tu negocio</p>
            </div>

            <div className="flex gap-14 w-[90%] justify-center ml-[200px]">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Input type="email" placeholder="Email" className="!placeholder-white focus:placeholder-white" />
                    <Button type="submit">Registrate</Button>
                  </div>
                  <span>or</span>
                  <Button variant='success' type="submit">Obtener demo gratis sin registro</Button>
                </div>

              </div>

              <Image width={500} height={500} alt='work image' src={'/home-1.svg'} />
            </div>
          </div>

          <CustomWave />

          <div className="w-full p-10 bg-[#FFF2F2] mt-[-2px]">
            <div className="flex flex-col items-center gap-4 mb-10">
              <p className="font-bold text-4xl">Que hacemos?</p>
              <p className="font-normal text-3xl">Contamos con todos estos servicios</p>
            </div>

            <div className="w-[75%] m-auto grid gap-4 gap-y-10 grid-cols-[repeat(auto-fill,minmax(400px,1fr))] md:grid-cols-3 justify-items-center">
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

          <CustomWave rotated rectColor='#9a3e6a' isBottom />

          <div className="w-full mt-[-1px]" style={{ backgroundImage: 'linear-gradient(180deg, #9a3e6a  30%, #4d6dbb 80%)' }}>

            <div className="flex flex-col items-center gap-4 mb-10 p-10 text-white">
              <p className="font-bold text-4xl">Unite a Gestionate</p>
              <p className="font-normal text-3xl w-[800px] text-balance text-center">Planes a tu medida, y todas las funcionalidades disponibles para optimizar tu jornada laboral</p>
                <Link href='/pricing'>
                  <Button type="button" className="my-5">
                    Ver precios
                  </Button>
                </Link>
              <div className="flex w-full justify-around">
                <div className="flex flex-col gap-2">
                  {quickPlans.map(plan => (
                    <QuickPlansCard
                      key={plan.planTitle}
                      planTitle={plan.planTitle}
                      planDescription={plan.planDescription}
                    />
                  ))}
                </div>
                <Image width={500} height={500} alt='office image' src={'/home-2.svg'} />
              </div>
            </div>
          </div>

          <CustomWave rectColor="#4d6dbb" isBottom />

          <div className="w-full flex flex-col items-center gap-4 bg-[#FFF2F2] mt-[-2px]">
            <p className="font-bold text-4xl">Echa un vistazo</p>
            <p className="font-normal text-3xl">Prueba nuestra <span className="font-semibold">demo gratis</span> sin registrarte</p>
          </div>

          <div className="w-full flex justify-center gap-4 p-10 bg-[#FFF2F2] mt-[-1px]">
            {takeALook.map(element => (
              <TakeALookCard
                key={element.altImage}
                image={element.image}
                altImage={element.altImage}
                title={element.title}
              />
            ))}

          </div>

          <div className="flex items-center justify-center w-full bg-[#FFF2F2]">
            <Button type="submit" variant='success'>Obtener Demo sin registro</Button>
          </div>

          <LandingFooter />
        </div>
      )}
    </div>

  );
}