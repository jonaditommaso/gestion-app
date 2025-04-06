'use client'

import { useGetMember } from "@/features/members/api/use-get-member";

const AccountType = () => {
    const { data: member } = useGetMember();

    return (
        <div className="text-center">
            <p className="text-xl">Tipo de cuenta</p>
            <p>{member?.role}</p>
        </div>
    );
}

export default AccountType;