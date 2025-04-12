'use client'

import { useCurrent } from "@/features/auth/api/use-current";


const AccountType = () => {
    const { data: user } = useCurrent();

    return (
        <div className="text-center">
            <p className="text-xl">Tipo de cuenta</p>
            <p>{user?.prefs.role === 'ADMIN' ? 'ADMIN' : 'CREATOR' }</p>
        </div>
    );
}

export default AccountType;