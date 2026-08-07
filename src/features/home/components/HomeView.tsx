import NoTeamWarning from "./NoTeamWarning";
import { getCurrent, getIsDemoUser } from "@/features/auth/queries";
import HomeWidgets from "./HomeWidgets";
import { getActiveContext } from "@/features/team/server/utils";
import { cookies } from "next/headers";

const HomeView = async () => {
    const user = await getCurrent();
    const isDemo = await getIsDemoUser();

    let hasContext = false;

    if (isDemo) {
        hasContext = true;
    } else {
        const cookieStore = await cookies();
        const activeMembershipId = cookieStore.get('active-org-id')?.value;
        const context = user ? await getActiveContext(user, activeMembershipId) : null;
        hasContext = !!context;
    }

    return (
        <div className="mt-20 ml-14">
            {hasContext
                ? <HomeWidgets />
                : <NoTeamWarning />
            }
        </div>
    );
}

export default HomeView;