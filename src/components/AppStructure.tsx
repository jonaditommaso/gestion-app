import { getCurrentSession, getIsDemoUser } from "@/features/auth/queries";
import AppNavbar from "./AppNavbar";
import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import AppSidebar from "./AppSidebar";
import PinnedNotePreview from "./PinnedNotePreview";

const AppStructure = async () => {
  const hasSession = await getCurrentSession();
  const isDemo = await getIsDemoUser();

  return (
    <div className="flex flex-col justify-center w-full items-center">
      {hasSession ? <AppNavbar /> : <LandingNavbar />}
      {hasSession && (
        <>
          {!isDemo && <PinnedNotePreview />}
          <div className="absolute top-0 left-0 h-full">
            <AppSidebar />
          </div>
        </>
      )}
    </div>
  );
}

export default AppStructure;