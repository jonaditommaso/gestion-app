import NoTeamWarning from "./NoTeamWarning";
import { getCurrent } from "@/features/auth/queries";
import HomeWidgets from "./HomeWidgets";


const HomeView = async () => {
    const user = await getCurrent();

    return (
        <div className="mt-20 ml-14">
            {!user?.prefs.company && <NoTeamWarning />}
            <HomeWidgets />
        </div>
    );
}

export default HomeView;