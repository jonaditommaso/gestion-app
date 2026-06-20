import { getCurrentSession } from "@/features/auth/queries";
import TeamList from "@/features/team/components/TeamList";

import { redirect } from "next/navigation";

const TeamView = async () => {
    const hasSession = await getCurrentSession();

    if (!hasSession) redirect('/login');

    return (
        <div className="w-full flex px-10">
            <TeamList />
        </div>
    );
}

export default TeamView;