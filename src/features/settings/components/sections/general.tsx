import { TooltipContainer } from "@/components/TooltipContainer";
import { Input } from "@/components/ui/input";
import { getCurrent } from "@/features/auth/queries";
import UserName from "./UserName";

const General = async () => {
    const user = await getCurrent();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
                <h2>Nombre</h2>
                <UserName name={user?.name ?? ''} />
            </div>
            <div className="flex items-center justify-between w-full">
                <h2>Email</h2>
                <TooltipContainer tooltipText="Is not possible change the email for now">
                    <Input type="email" className="w-[200px]" readOnly disabled value={user?.email} />
                </TooltipContainer>
            </div>
        </div>
    );
}

export default General;