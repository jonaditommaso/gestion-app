import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import TaskIdClient from "./client";


const TaskView = async () => {
    const user = await getCurrent();

    if(!user) redirect('/login');

    return <TaskIdClient />
}

export default TaskView;