import { useParams } from "next/navigation";

export const useInviteCodeWorkspace = () => {
    const params = useParams();
    return params.inviteCode as string;
}