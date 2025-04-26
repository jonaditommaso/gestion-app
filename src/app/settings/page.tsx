import { Separator } from "@/components/ui/separator";
import { getCurrent } from "@/features/auth/queries";
import AccountType from "@/features/settings/components/AccountType";
import Languages from "@/features/settings/components/Languages";
import ProfilePhotoEdition from "@/features/settings/components/ProfilePhotoEdition";
import { settingsSections } from "@/features/settings/components/sections";
import SettingSection from "@/features/settings/components/SettingSection";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

const SettingsView = async () => {
    const user = await getCurrent();
    const t = await getTranslations('settings')

    if(!user) redirect('/login');

    return (
        <div className="w-full mt-24 flex flex-col items-center">
            <h1 className="font-semibold text-2xl mb-10">{t('account-settings')}</h1>
            <div className="w-full flex justify-around">
                <div>
                    {settingsSections.map(setting => {
                        const { title, id, section, type = undefined, permission = undefined } = setting;

                        if (permission === 'demo') return;
                        return (
                            <SettingSection title={title} key={id} type={type}>
                                {section}
                            </SettingSection>
                        )
                    })}
                </div>
                <div className="w-[400px] flex flex-col items-center">
                    <ProfilePhotoEdition user={user} />
                    <Separator className="my-10" />
                    <Languages />
                    <Separator className="my-10" />
                    <AccountType />
                </div>
            </div>
        </div>
    );
}

export default SettingsView;