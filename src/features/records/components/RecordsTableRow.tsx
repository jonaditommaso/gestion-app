'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, Pencil, Trash2, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { TooltipContainer } from "@/components/TooltipContainer";
import { useTranslations } from "next-intl";
import { useDeleteRecordsTable } from "../api/use-delete-records-table";
import { useUpdateRecordsTable } from "../api/use-update-records-table";

interface RecordsTableRowProps {
    tableName: string,
    index: number,
    actionDisabled: boolean,
    setEditingTable: Dispatch<SetStateAction<number | undefined>>,
    editingTable: number | undefined,
    id: string,
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const disabledClassName = 'text-zinc-200 cursor-default pointer-events-none'

// Refactor this in future, is the same structure than CategoryRow
const RecordsTableRow = ({ tableName, index, actionDisabled, setEditingTable, editingTable, id, setIsOpen }: RecordsTableRowProps) => {
    const [editedNameTable, seteditedNameTable] = useState(tableName);
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const { mutate: updateTableName } = useUpdateRecordsTable();
    const { mutateAsync: deleteTable } = useDeleteRecordsTable();
    const t =  useTranslations('records');

    const handleClick = () => {
        if (editingTable === index) {

            updateTableName({
                json: {tableName: editedNameTable},
                param: { tableId: id }
            })
        } else {
            setEditingTable(index)
        }
    }

    const handleDelete = async () => {
        const response = await deleteTable({ param: { tableId: id }})
        setPopoverIsOpen(false);

        if (response?.data?.remaining === 0) {
            setIsOpen(false);
        }
    }

    const handleCancel = () => {
        setEditingTable(undefined);
        seteditedNameTable(tableName)
    }

    return (
        <TableRow key={id}>
            <TableCell className="flex items-center justify-between">
                {editingTable === index
                    ? <Input
                        placeholder={t('new-table')}
                        value={editedNameTable}
                        onChange={(e) => seteditedNameTable(e.target.value)}
                        className="border-l-0 border-t-0 border-r-0 rounded-none focus-visible:ring-0 px-0 h-4 border-none !text-[16px]"
                    />
                    : <p className="w-full items-center h-4 text-[16px] leading-none">{tableName}</p>
                }
                <div className="flex gap-2 items-center">
                    <TooltipContainer tooltipText={editingTable === index ? t('save') : t('edit')}>
                        <span
                            className={cn("cursor-pointer", editingTable === undefined ? 'text-blue-600' : (actionDisabled ? disabledClassName : 'text-green-600'))}
                            onClick={handleClick}
                        >
                            {editingTable === index ? <Check className="size-4" /> : <Pencil className="size-4" />}
                        </span>
                    </TooltipContainer>
                    {editingTable === index && (
                        <TooltipContainer tooltipText={t('cancel')}>
                            <span className="cursor-pointer text-red-600" onClick={handleCancel}><XIcon className="size-4" /></span>
                        </TooltipContainer>
                    )}
                    <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                            <TooltipContainer tooltipText={t('delete')}>
                                <PopoverTrigger asChild>
                                    <span className="cursor-pointer text-red-600"><Trash2 className="size-4" /></span>
                                </PopoverTrigger>
                            </TooltipContainer>
                        <PopoverContent>
                            <p className="text-sm text-balance text-center">{t('are-you-sure-delete')}</p>
                            <Separator className="my-2"/>
                            <div className="flex items-center gap-2 justify-center">
                                <Button variant='outline' size='sm' onClick={() => setPopoverIsOpen(false)}>{t('cancel')}</Button>
                                <Button variant='destructive' size='sm' onClick={handleDelete}>{t('delete')}</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </TableCell>
        </TableRow>
    );
}

export default RecordsTableRow;