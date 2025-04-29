//import { Button } from "@/components/ui/button";
import { CalendarDemo } from "./Calendar";
import MyNotes from "./MyNotes";
import ToDoTasksWidget from "./ToDoTasksWidget";
//import { Headset } from "lucide-react";
//import CalendarEvents from "./CalendarEvents";
import SendMessageButton from "./messages/SendMessageButton";
import { MessagesContainer } from "./messages/MessagesContainer";
import ShortcutButton from "./ShortcutButton";
import NoTeamWarning from "./NoTeamWarning";
import { getCurrent } from "@/features/auth/queries";


const HomeView = async () => {
    const user = await getCurrent();

    //? restore this structure when calendar events it's ready
    // return (
    //     <div className="mt-24 gap-4 ml-14 grid grid-cols-3">
    //         <MyNotes />
    //         <MessagesContainer />
    //         <div className="flex col-span-1 gap-2">
    //             <div className="col-span-1 w-56 flex flex-col gap-5 justify-between">
    //                 <SendMessageButton />
    //                 {/* <Button className="w-full py-10 h-auto" variant='outline'>
    //                     <Headset /> <span>Setear una reunion</span>
    //                 </Button> */}
    //                 <ShortcutButton />
    //             </div>
    //             <CalendarDemo />
    //             {/* Mas adelante puedo poner algunas integraciones por aca (spotify por ej) */}
    //         </div>
    //         <ToDoTasksWidget />
    //         {/* <CalendarEvents /> */}
    //     </div>
    // );
    return (
        <div className="mt-20 ml-14">
            {!user?.prefs.company && <NoTeamWarning />}
            <div className="gap-4 grid grid-cols-3">
                <MyNotes />
                <MessagesContainer />
                <div className="flex col-span-1 gap-2">
                    <CalendarDemo />
                    {/* Mas adelante puedo poner algunas integraciones por aca (spotify por ej) */}
                </div>
                <ToDoTasksWidget />
                    <div className="col-span-1 w-56 flex flex-col gap-5 justify-between">
                        <SendMessageButton />
                        {/* <Button className="w-full py-10 h-auto" variant='outline'>
                            <Headset /> <span>Setear una reunion</span>
                        </Button> */}
                        <ShortcutButton />
                    </div>
                {/* <CalendarEvents /> */}
            </div>
        </div>
    );
}

export default HomeView;