import RecordsContextProvider from "@/context/RecordsContext";
import { getCurrent } from "@/features/auth/queries";
import RecordsContent from "@/features/records/RecordsContent";
import { redirect } from "next/navigation";

const RecordsView = async () => {
    const user = await getCurrent();
    if(!user) redirect('/');

    return <RecordsContextProvider>
        <RecordsContent />
    </RecordsContextProvider>
}

export default RecordsView;