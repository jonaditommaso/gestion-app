// import MfaCard from "@/features/auth/components/MfaCard";
// import { redirect } from "next/navigation";
// import { cookies } from 'next/headers';

// export default async function MfaView({ searchParams }: { searchParams: { token?: string, challengeId?: string } }) {
//     const cookieStore = await cookies();
//     const queryToken = searchParams?.token;
//     const queryChallengeId = searchParams?.challengeId;
//     const cookieToken = cookieStore.get('mfa_token')?.value;

//     if (!queryToken || queryToken !== cookieToken || !queryChallengeId) {
//         redirect('/');
//     }

//     return (
//         <div>
//             <MfaCard challengeId={queryChallengeId} />
//         </div>
//     );
// }
export default async function MfaView () {
    return <>Working on this</>
}