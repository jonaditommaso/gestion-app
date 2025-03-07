import { getCurrent } from "@/features/auth/queries";
import LoginCard from "@/features/auth/components/LoginCard";
import { redirect } from "next/navigation";

const LoginView = async () => {
    const user = await getCurrent();

    if(user) redirect('/');

    return (
        <div>
            <LoginCard />
        </div>
    );
}

export default LoginView;