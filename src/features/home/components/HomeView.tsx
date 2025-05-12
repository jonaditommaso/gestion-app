import { CalendarDemo } from "./Calendar";
import MyNotes from "./notes/MyNotes";
import ToDoTasksWidget from "./ToDoTasksWidget";
import SendMessageButton from "./messages/SendMessageButton";
import { MessagesContainer } from "./messages/MessagesContainer";
import ShortcutButton from "./shortcut/ShortcutButton";
import NoTeamWarning from "./NoTeamWarning";
import { getCurrent } from "@/features/auth/queries";
import CreateMeetButton from "./meets/CreateMeetButton";
import CalendarEvents from "./CalendarEvents";


const HomeView = async () => {
    const user = await getCurrent();

    return (
        <div className="mt-20 ml-14">
            {!user?.prefs.company && <NoTeamWarning />}
            <div className="gap-4 grid grid-cols-3">
                <MyNotes />
                <MessagesContainer />
                <div className="flex col-span-1 gap-2">
                    <div className="col-span-1 w-56 flex flex-col gap-5 justify-between">
                        <SendMessageButton />
                        <ShortcutButton />
                        <CreateMeetButton />
                    </div>
                    <CalendarDemo />
                    {/* Mas adelante puedo poner algunas integraciones por aca (spotify por ej) */}
                </div>
                <ToDoTasksWidget />
                <CalendarEvents />
            </div>
        </div>

    );
}

export default HomeView;