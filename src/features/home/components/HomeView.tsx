//import { Button } from "@/components/ui/button";
import { CalendarDemo } from "./Calendar";
import MyNotes from "./notes/MyNotes";
import ToDoTasksWidget from "./ToDoTasksWidget";
//import CalendarEvents from "./CalendarEvents";
import SendMessageButton from "./messages/SendMessageButton";
import { MessagesContainer } from "./messages/MessagesContainer";
import ShortcutButton from "./ShortcutButton";
import NoTeamWarning from "./NoTeamWarning";
import { getCurrent } from "@/features/auth/queries";
import CreateMeetButton from "./CreateMeetButton";
import CalendarEvents from "./CalendarEvents";


const HomeView = async () => {
    const user = await getCurrent();

    //? restore this structure when calendar events it's ready
    return (
        <div className="mt-24 gap-4 ml-14 grid grid-cols-3">
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
    );
}

export default HomeView;