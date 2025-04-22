import { Button } from "@/components/ui/button";
import { CalendarDemo } from "./Calendar";
import { CardNotes } from "./CardNotes";
import MyNotes from "./MyNotes";
import ToDoTasksWidget from "./ToDoTasksWidget";
import { Headset, MessageSquareText, Plus } from "lucide-react";
import CalendarEvents from "./CalendarEvents";

const HomeView = () => {
    return (
        <div className="mt-24 gap-4 ml-14 grid grid-cols-3">
            <MyNotes />
            <CardNotes />
            <div className="flex col-span-1 gap-2">
                <div className="col-span-1 w-56 flex flex-col gap-5 justify-between">
                    <Button className="w-full py-10 h-auto" variant='outline'>
                        <MessageSquareText /> <span>Enviar un mensaje</span>
                    </Button>
                    <Button className="w-full py-10 h-auto" variant='outline'>
                        <Headset /> <span>Setear una reunion</span>
                    </Button>
                    <Button className="w-full py-10 h-auto" variant='outline'>
                        <Plus /> <span>Agregar atajo</span>
                    </Button>
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