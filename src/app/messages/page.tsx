import { getCurrentSession } from "@/features/auth/queries";
import MessagesView from "@/features/home/components/messages/MessagesView";
import { redirect } from "next/navigation";

const MessagesPage = async () => {
    const hasSession = await getCurrentSession();
    if (!hasSession) redirect('/');

    return (
        <div className="mt-20 ml-14 h-[calc(100vh-5rem)] overflow-hidden">
            <MessagesView />
        </div>
    );
}

export default MessagesPage;
