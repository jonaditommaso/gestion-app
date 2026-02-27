import { getCurrent } from "@/features/auth/queries";
import MessagesView from "@/features/home/components/messages/MessagesView";
import { redirect } from "next/navigation";

const MessagesPage = async () => {
    const user = await getCurrent();
    if (!user) redirect('/');

    return (
        <div className="mt-20 ml-14 h-[calc(100vh-5rem)] overflow-hidden">
            <MessagesView />
        </div>
    );
}

export default MessagesPage;
