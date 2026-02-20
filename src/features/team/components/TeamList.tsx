'use client'

import { useCurrent } from "@/features/auth/api/use-current";
import FadeLoader from "react-spinners/FadeLoader";
import { useGetMembers } from "../api/use-get-members";
import MemberCard from "./MemberCard";

const TeamList = () => {
    const { data: team, isLoading} = useGetMembers();
    const { data: currentUser } = useCurrent();

    if(isLoading) return (
        <div className="w-full flex justify-center">
            <FadeLoader color="#999" width={3} className="mt-5" />
        </div>
    )

    const sortedTeam = team
        ? [...team].sort((a, b) => {
            if (a.userId === currentUser?.$id) return -1;
            if (b.userId === currentUser?.$id) return 1;
            return 0;
        })
        : [];

    return (
        <div className="flex flex-wrap gap-4">
            {sortedTeam.map(member => {
                return (
                    //todo pass prefs object directly to avoid multiple passing
                    <MemberCard
                        key={member.$id}
                        memberId={member.$id}
                        userId={member.userId}
                        name={member.name}
                        email={member.email}
                        position={member.prefs.position}
                        image={member.prefs.image}
                        tags={(member.prefs.tags || '').split(',')}
                        role={member.prefs.role}
                        birthday={member.prefs.birthday}
                        description={member.prefs.description}
                        linkedin={member.prefs.linkedin}
                        memberSince={member.prefs.memberSince}
                        currentProject={member.prefs.currentProject}
                    />
                )})
            }
        </div>
    );
}

export default TeamList;