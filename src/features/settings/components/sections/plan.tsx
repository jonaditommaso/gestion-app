import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/queries";
import capitalize from "@/utils/capitalize";

const Plan = async () => {
    const user = await getCurrent();

    return (
        <div className="flex items-center justify-between w-full">
            <h2>{capitalize(user?.prefs?.plan)}</h2>
            <Button variant='outline'>Ver planes</Button>
        </div>
    );
}

export default Plan;