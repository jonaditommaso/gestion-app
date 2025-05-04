import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectContent } from "@radix-ui/react-select";
import '@/components/timePicker/time-picker.css' // is not necessary all this, check what I really need

const durationOptions = [
    {key: '15-minute', label: '15m'},
    {key: '30-minute', label: '30m'},
    {key: '1-hour', label: '1h'},
]

interface DurationSelectorProps {
    value: string,
    setValue: (value: string) => void
}

const DurationSelector = ({ value = '30-minute', setValue }: DurationSelectorProps) => {

    return (
        <Select value={value} onValueChange={val => setValue(val)}>
            <SelectTrigger className="w-[90px] !mt-0 h-10">
            <SelectValue placeholder="duration"/>
            </SelectTrigger>
            <SelectContent className="select-content-center bg-white z-10 p-1 rounded-md">
            {durationOptions.map((time) => (
                <SelectItem key={time.key} value={time.key}>
                <div className="flex items-center justify-center w-full">{time.label}</div>
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
    );
}

export default DurationSelector;