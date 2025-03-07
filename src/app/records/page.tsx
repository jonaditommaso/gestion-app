import { getCurrent } from "@/features/auth/queries";
import RecordsContent from "@/features/records/RecordsContent";
import { redirect } from "next/navigation";

const RecordsView = async () => {
    const user = await getCurrent();
    if(!user) redirect('/');

    return <RecordsContent />
}

export default RecordsView;