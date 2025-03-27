import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

const types = [
    { label: "Free plan", type: "free" },
    { label: "Pro plan", type: "pro" },
]

interface PlanSelectedProps {
    planSelected: string | null,
    setPlanSelected: Dispatch<SetStateAction<string | null>>,
}

const PlanSelected = ({planSelected, setPlanSelected}: PlanSelectedProps) => {

    return (
        <div className="flex gap-2 w-full text-center mb-4">
            {types.map(({ label, type }) => (
                <label key={type} className="cursor-pointer flex-1">
                    <Input
                        type="radio"
                        className="hidden"
                        checked={planSelected === type}
                        onChange={() => setPlanSelected(type)}
                        defaultChecked={types[0].type === type}
                        defaultValue={types[0].type}
                    />
                    <div
                        className={`px-4 py-2 rounded-md w-full transition-colors ${
                            planSelected === type
                            ? `border-2 border-t-8 text-blue-600 border-t-blue-600`
                            : `border-2 border-t-8 border-t-zinc-300 bg-muted text-muted-foreground`
                        }`}
                    >
                        {label}
                    </div>
                </label>
            ))} *
        </div>
    );
}

export default PlanSelected;