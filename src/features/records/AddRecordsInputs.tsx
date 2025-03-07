import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

type RecordData = {
    field: string;
    value: string;
}

interface AddRecordsInputsProps {
    setRecordData: Dispatch<SetStateAction<RecordData[]>>,
    index: number,
    data: RecordData
}

const AddRecordsInputs = ({ data, setRecordData, index }: AddRecordsInputsProps) => {
    const [customField, setCustomField] = useState(false);

    const handleAddData = () => {
        const emptyNewData = {field: '', value: ''}
        setRecordData(prev => ([...prev, emptyNewData]))
    }

    const onChange = (value: string, atr: 'value' | 'field') => {
        setRecordData((prev) => {
            const updatedRecords = [...prev];
            updatedRecords[index] = {
                ...updatedRecords[index],
                [atr]: value,
            };
            return updatedRecords;
        });
    }

    return (
        <div className="grid gap-4 py-4">
            <>
                {customField
                ? (
                    <div className="grid grid-cols-4 items-center gap-4 justify-between">
                        <Label htmlFor={`field-name-${index}`} className="text-center">Campo</Label>
                        <Input id={`field-name-${index}`} value={data.field} className="col-span-3" onChange={(e) => onChange(e.target.value, 'field')} />
                    </div>
                )
                : (
                    <div className="grid grid-cols-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="max-w-full flex items-center justify-between gap-2 p-2 border rounded-sm focus:outline-none">
                            <p className="text-zinc-800 text-sm">Nombre</p>
                            <ChevronsUpDown size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem className="min-w-60 flex items-center justify-center p-2" onClick={() => setCustomField(true)}>
                                Apellido
                            </DropdownMenuItem>
                            <DropdownMenuItem className="min-w-60 flex items-center justify-center p-2" onClick={() => setCustomField(true)}>
                                Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="min-w-60 flex items-center justify-center p-2" onClick={() => setCustomField(true)}>
                                <span className="w-40px"><Plus className="border rounded-md p-0.5" size={20} /></span> Crear nuevo campo
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                )}
            </>

            <div className="grid grid-cols-4 items-center gap-4 justify-between">
                <Label htmlFor={`field-value-${index}`} className="text-center">Valor</Label>
                <Input
                    id={`field-value-${index}`}
                    value={data.value}
                    onChange={(e) => onChange(e.target.value, 'value')}
                    className="col-span-3"
                />
            </div>

            <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="w-40px"><Plus className="border rounded-md p-0.5 cursor-pointer hover:bg-neutral-100" size={20} onClick={() => handleAddData()} /></span>
                <Separator className="flex-1" />
            </div>
        </div>
    );
}

export default AddRecordsInputs;