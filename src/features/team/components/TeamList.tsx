'use client'

import FadeLoader from "react-spinners/FadeLoader";
import { useGetMembers } from "../api/use-get-members";
import MemberCard from "./MemberCard";

const TeamList = () => {
    const { data: team, isLoading} = useGetMembers();

    if(isLoading) return <FadeLoader color="#999" width={3} className="mt-5" />

    return (
        team?.map(member => {
            return (
            <MemberCard
                key={member.$id}
                userId={member.userId}
                name={member.name}
                email={member.email}
                position={'Frontend Dev'}
                image={member.prefs.image}
                tags={member.prefs.tags}
                role={member.prefs.role}
            />
        )})
    );
}

export default TeamList;