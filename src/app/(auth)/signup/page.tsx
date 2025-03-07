import { getCurrent } from "@/features/auth/queries";
import SignUpCard from "@/features/auth/components/SignUpCard";
import { redirect } from "next/navigation";

const SignUpView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div>
            <SignUpCard />
        </div>
    );
}

export default SignUpView;