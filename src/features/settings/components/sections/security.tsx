import { getCurrent } from "@/features/auth/queries";
import MFA from "./MFA";
import { getTranslations } from "next-intl/server";
import PasswordEdition from "./PasswordEdition";

const Security = async () => {
    const user = await getCurrent();
    const t = await getTranslations('settings')
    const canChangePassword = !user?.isOAuth;

    return (
        <div className="flex flex-col gap-4">
            {canChangePassword && (
                <div className="flex items-center justify-between w-full">
                    <h2>{t('password')}</h2>
                    <PasswordEdition />
                </div>
            )}
            <div className="flex items-center justify-between w-full">
                <h2>{t('2fa')}</h2>
                <MFA hasMFA={user?.mfa} />
            </div>
        </div>
    );
}

export default Security;