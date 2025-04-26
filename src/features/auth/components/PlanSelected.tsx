'use client'
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

const types = [
    { label: "free-plan", type: "free" },
    { label: "pro-plan", type: "pro" },
]

interface PlanSelectedProps {
    planSelected: string | null,
    setPlanSelected: Dispatch<SetStateAction<string | null>>,
}

const PlanSelected = ({planSelected, setPlanSelected}: PlanSelectedProps) => {
    const t = useTranslations('auth')

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
                        {t(label)}
                    </div>
                </label>
            ))} *
        </div>
    );
}

export default PlanSelected;