'use client'

import FadeLoader from "react-spinners/FadeLoader";
import { useGetMembers } from "../api/use-get-members";
import MemberCard from "./MemberCard";

const TeamList = () => {
    const { data: team, isLoading} = useGetMembers();

    if(isLoading) return (
        <div className="w-full flex justify-center">
            <FadeLoader color="#999" width={3} className="mt-5" />
        </div>
    )

    return (
        team?.map(member => {
            return (
            //todo pass prefs object directly to avoid multiple passing
            <MemberCard
                key={member.$id}
                userId={member.userId}
                name={member.name}
                email={member.email}
                position={member.prefs.position}
                image={member.prefs.image}
                tags={(member.prefs.tags || '').split(',')}
                role={member.prefs.role}
                birthday={member.prefs.birthday}
            />
        )})
    );
}

export default TeamList;