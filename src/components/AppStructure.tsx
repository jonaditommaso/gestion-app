import { getCurrent } from "@/features/auth/queries";
import AppNavbar from "./AppNavbar";
import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import AppSidebar from "./AppSidebar";

const AppStructure = async () => {
  const user = await getCurrent();

  return (
    <div className="flex flex-col justify-center w-full items-center">
      {user ? <AppNavbar /> : <LandingNavbar />}
      {user && (
        <div className="absolute top-0 left-0 h-full">
          <AppSidebar />
        </div>
      )}
    </div>
  );
}

export default AppStructure;