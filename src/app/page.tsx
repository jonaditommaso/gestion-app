import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrent } from "@/features/auth/queries";
import Image from "next/image";
import { CalendarDemo } from "@/features/home/components/Calendar";
import { CardNotes } from "@/features/home/components/CardNotes";
// import UserButton from "@/features/auth/components/UserButton";
// import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
// import { redirect } from "next/navigation";
// import AppNavbar from "../components/AppNavbar";
// import AppSidebar from "../components/AppSidebar";

export default async function Home() {
  const user = await getCurrent();

  //if(!user) redirect('/login');

  return (
    <>
    {/* // <div className="flex flex-col justify-center w-full items-center"> */}
      {/* {user ? <AppNavbar /> : <LandingNavbar />} */}

      {/* className='relative h-screen' */}
      <div>
        {/* {user && <div className="absolute top-0 left-0 h-full">
          <AppSidebar />
        </div>
        } */}
        {user
        // max-w-screen-md
        ? <div className="ml-[var(--sidebar-width)] flex justify-center mt-24 gap-10">
          <CardNotes />
          <CardNotes />
          <CalendarDemo />
        </div>
        :

        <div className="flex flex-col items-center">
              <div className="max-w-screen-md flex flex-col justify-center mt-24">
                <p className="text-6xl font-bold text-balance text-center">Gestiona y organiza todo tu trabajo en un solo lugar</p>
                <p className="font-semibold mt-5 text-center">Facilidad para tu equipo, resultados para tu negocio</p>
              </div>

              {/* ml-44 */}
              <div className="flex gap-14 w-[70%] justify-center ml-[200px]">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input type="email" placeholder="Email" />
                  <Button type="submit">Registrate</Button>
                </div>

                <Image width={500} height={500} alt='work image' src={'/project-team-undreaw.svg'} />
              </div>
        </div>
        }
      </div>
      {/* <div className="flex">
        {!user && <AppSidebar />}

      <>
        <div className="max-w-screen-md flex flex-col justify-center mt-24">
          <p className="text-6xl font-bold text-balance text-center">Gestiona y organiza todo tu trabajo en un solo lugar</p>
          <p className="font-semibold mt-5 text-center">Facilidad para tu equipo, resultados para tu negocio</p>
        </div>

        <div className="flex gap-14 w-full justify-end mr-44">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="email" placeholder="Email" />
            <Button type="submit">Registrate</Button>
          </div>

          <Image width={500} height={500} alt='work image' src={'/project-team-undreaw.svg'} />
        </div>
      </>
      </div> */}

    {/* </div> */}
    </>
  );
}