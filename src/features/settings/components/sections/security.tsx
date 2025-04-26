import { Input } from "@/components/ui/input";
import { getCurrent } from "@/features/auth/queries";
import MFA from "./MFA";
import { getTranslations } from "next-intl/server";

const Security = async () => {
    const user = await getCurrent();
    const t = await getTranslations('settings')

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
                <h2>{t('password')}</h2>
                <Input type="password" className="w-[200px]" />
            </div>
            <div className="flex items-center justify-between w-full">
                <h2>{t('2fa')}</h2>
                <MFA hasMFA={user?.mfa} />
            </div>
        </div>
    );
}

export default Security;