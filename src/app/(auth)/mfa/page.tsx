import MfaCard from "@/features/auth/components/MfaCard";
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';

type MfaSearchParams = {
    token?: string;
    challengeId?: string;
}

export default async function MfaView({ searchParams }: { searchParams: Promise<MfaSearchParams> }) {
    const cookieStore = await cookies();
    const params = await searchParams;
    const queryToken = params?.token;
    const queryChallengeId = params?.challengeId;
    const cookieToken = cookieStore.get('mfa_token')?.value;

    if (!queryToken || queryToken !== cookieToken || !queryChallengeId) {
        redirect('/');
    }

    return (
        <div>
            <MfaCard challengeId={queryChallengeId} />
        </div>
    );
}
// export default async function MfaView () {
//     return <>Working on this</>
// }