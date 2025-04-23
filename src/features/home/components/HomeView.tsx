import { Button } from "@/components/ui/button";
import { CalendarDemo } from "./Calendar";
import MyNotes from "./MyNotes";
import ToDoTasksWidget from "./ToDoTasksWidget";
import { Headset } from "lucide-react";
import CalendarEvents from "./CalendarEvents";
import SendMessageButton from "./messages/SendMessageButton";
import { MessagesContainer } from "./messages/MessagesContainer";
import ShortcutButton from "./ShortcutButton";

const HomeView = () => {
    return (
        <div className="mt-24 gap-4 ml-14 grid grid-cols-3">
            <MyNotes />
            <MessagesContainer />
            <div className="flex col-span-1 gap-2">
                <div className="col-span-1 w-56 flex flex-col gap-5 justify-between">
                    <SendMessageButton />
                    <Button className="w-full py-10 h-auto" variant='outline'>
                        <Headset /> <span>Setear una reunion</span>
                    </Button>
                    <ShortcutButton />
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