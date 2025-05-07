import { getCurrent } from "@/features/auth/queries";
import RecordView from "@/features/records/RecordView";
import { redirect } from "next/navigation";

const Record = async () => {
    const user = await getCurrent();
    if(!user) redirect('/');

    return (
        <RecordView />
    );
}

export default Record;