import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { ChevronsUpDown, List, Plus, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useGetContextRecords } from "./hooks/useGetContextRecords";
import capitalize from "@/utils/capitalize";
import { useTranslations } from "next-intl";
import { cn } from '../../lib/utils';

type RecordData = {
    field: string;
    value: string;
}

interface AddRecordsInputsProps {
    setRecordData: Dispatch<SetStateAction<RecordData[]>>,
    index: number,
    data: RecordData,
    headersUsed: string[],
    isLastItem: boolean,
    totalRecords: number
}

const AddRecordsInputs = ({ data, setRecordData, index, headersUsed, isLastItem, totalRecords }: AddRecordsInputsProps) => {
    const { data: dataRecords } = useGetContextRecords();
    const headers = dataRecords?.documents[0]?.headers;

    const [customField, setCustomField] = useState(headers?.length === 0);
    const t = useTranslations('records')

    const handleAddData = () => {
        const emptyNewData = {field: '', value: ''}
        setRecordData(prev => ([...prev, emptyNewData]))
    }

    const handleRemoveData = () => {
        setRecordData(prev => prev.filter((_, i) => i !== index))
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
        <div className="relative pt-6">
            {totalRecords > 1 && (
                <button
                    type="button"
                    onClick={handleRemoveData}
                    className="absolute top-0 right-0 p-1 rounded-md hover:bg-destructive/10 cursor-pointer text-destructive z-10"
                    title={t('delete')}
                >
                    <X size={16} />
                </button>
            )}
            <div className="grid gap-4 pb-4">
                <>
                    {customField
                ? (
                    <div className="grid grid-cols-4 items-center gap-4 justify-between">
                        <Label htmlFor={`field-name-${index}`} className="text-center">{t('field')}</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input id={`field-name-${index}`} value={data.field} className="flex-1" onChange={(e) => onChange(e.target.value, 'field')} />
                            {headers?.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="p-2 border rounded-md hover:bg-accent cursor-pointer">
                                        <List size={16} />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {headers?.map((header: string) => (
                                            <DropdownMenuItem
                                                key={header}
                                                className="min-w-60 flex items-center justify-center p-2 cursor-pointer"
                                                onClick={() => {
                                                    onChange(header, 'field');
                                                    setCustomField(false);
                                                }}
                                                disabled={headersUsed.includes(header)}
                                            >
                                                {capitalize(header)}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                )
                : (
                    <div className="grid grid-cols-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="max-w-full flex items-center justify-between gap-2 p-2 border rounded-sm focus:outline-none">

                            <p className={cn('text-sm', data.field ? 'text-primary' : 'text-muted-foreground')}>{data.field ? capitalize(data.field) : t('choise-field')}</p>
                            <ChevronsUpDown size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {headers?.map((header: string) => (
                                <DropdownMenuItem key={header} className="min-w-60 flex items-center justify-center p-2 cursor-pointer" onClick={() => onChange(header, 'field')} disabled={headersUsed.includes(header)}>
                                    {capitalize(header)}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem className="min-w-60 flex items-center justify-center p-2 cursor-pointer" onClick={() => setCustomField(true)}>
                                <span className="w-40px"><Plus className="border rounded-md p-0.5" size={20} /></span> {t('create-new-field')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                )}
            </>

            <div className="grid grid-cols-4 items-center gap-4 justify-between">
                <Label htmlFor={`field-value-${index}`} className="text-center">{t('value')}</Label>
                <Input
                    id={`field-value-${index}`}
                    value={data.value}
                    onChange={(e) => onChange(e.target.value, 'value')}
                    className="col-span-3"
                />
            </div>

            <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                {isLastItem && (
                    <>
                        <span className="w-40px"><Plus className="border rounded-md p-0.5 cursor-pointer hover:opacity-70 text-primary" size={20} onClick={() => handleAddData()} /></span>
                        <Separator className="flex-1" />
                    </>
                )}
            </div>
            </div>
        </div>
    );
}

export default AddRecordsInputs;