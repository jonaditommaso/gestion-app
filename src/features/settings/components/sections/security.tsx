import { Input } from "@/components/ui/input";
import { getCurrent } from "@/features/auth/queries";
import MFA from "./MFA";

const Security = async () => {
    const user = await getCurrent();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
                <h2>Password</h2>
                <Input type="password" className="w-[200px]" />
            </div>
            <div className="flex items-center justify-between w-full">
                <h2>Autenticacion en 2 pasos</h2>
                <MFA hasMFA={user?.mfa} />
            </div>
        </div>
    );
}

export default Security;