import NoTeamWarning from "./NoTeamWarning";
import { getCurrent } from "@/features/auth/queries";
import HomeWidgets from "./HomeWidgets";
import { createAdminClient } from "@/lib/appwrite";
import { getActiveContext } from "@/features/team/server/utils";
import { cookies } from "next/headers";


const HomeView = async () => {
    const user = await getCurrent();
    const isDemo = user?.prefs?.isDemo === true;

    let hasContext = false;
    if (isDemo) {
        hasContext = true;
    } else {
        const cookieStore = await cookies();
        const activeMembershipId = cookieStore.get('active-org-id')?.value;
        const { databases } = await createAdminClient();
        const context = user ? await getActiveContext(user, databases, activeMembershipId) : null;
        hasContext = !!context;
    }

    return (
        <div className="mt-20 ml-14">
            {!hasContext && <NoTeamWarning />}
            {hasContext && <HomeWidgets />}
        </div>
    );
}

export default HomeView;