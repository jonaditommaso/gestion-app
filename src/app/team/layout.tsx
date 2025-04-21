import { getCurrent } from "@/features/auth/queries";
import AddNewMember from "@/features/team/components/AddNewMember";
import { getTranslations } from "next-intl/server";

interface TeamLayoutProps {
    children: React.ReactNode
}

const TeamLayout = async ({children}: TeamLayoutProps) => {
    const user = await getCurrent();
    const t = await getTranslations('team');

    return (
        <div className="flex flex-col w-[90%] mt-[50px] m-auto">
            {user ? (
                <>
                    <div className="m-10 flex w-full justify-between">
                        <h1 className=" text-2xl font-semibold">{t('team-title')}</h1>
                        <AddNewMember />
                    </div>
                    <div>
                        {children}
                    </div>
                </>
            )
            : children
            }
        </div>
    )
}

export default TeamLayout;