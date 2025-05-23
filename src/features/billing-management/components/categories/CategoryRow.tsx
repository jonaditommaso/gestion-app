'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, Pencil, Trash2, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useGetBillingOptions } from "../../api/use-get-billing-options";
import { useUpdateBillingOptions } from "../../api/use-update-billing-options";
import { TooltipContainer } from "@/components/TooltipContainer";
import { useTranslations } from "next-intl";

interface CategoryRowProps {
    category: string,
    index: number,
    actionDisabled: boolean,
    setEditingCategory: Dispatch<SetStateAction<number | undefined>>,
    editingCategory: number | undefined,
    type: string
}

const disabledClassName = 'text-zinc-200 cursor-default pointer-events-none'

const CategoryRow = ({ category, index, actionDisabled, setEditingCategory, editingCategory, type }: CategoryRowProps) => {
    const { data } = useGetBillingOptions();
    const {mutate: updateCategories} = useUpdateBillingOptions();
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const [newCategory, setNewCategory] = useState(category);
    const t =  useTranslations('billing')

    const incomeCategories = useMemo(() => data?.documents[0]?.incomeCategories || [], [data])
    const expenseCategories = useMemo(() => data?.documents[0]?.expenseCategories || [], [data])

    const handleClick = () => {
        if (editingCategory === index) {
            const newCategories = (type === 'income' ? incomeCategories : expenseCategories).with(index, newCategory)

            const payload = {
                incomeCategories,
                expenseCategories,
                [`${type}Categories`]: newCategories,
            };

            updateCategories({
                json: payload,
                param: { billingOptionId: data?.documents[0].$id || '' }
            })
        } else {
            setEditingCategory(index)
        }
    }

    const handleDelete = () => {
        const newCategories = (type === 'income' ? incomeCategories : expenseCategories).filter((typeCategory: string) => typeCategory !== category)

        const payload = {
            incomeCategories,
            expenseCategories,
            [`${type}Categories`]: newCategories,
        };

        updateCategories({
            json: payload,
            param: { billingOptionId: data?.documents[0].$id || '' }
        })

        setPopoverIsOpen(false)
    }

    const handleCancel = () => {
        setEditingCategory(undefined);
        setNewCategory(category);
    }

    return (
        <TableRow key={category}>
            <TableCell className="flex items-center justify-between">
                {editingCategory === index
                    ? <Input
                        placeholder={t('new-category')}
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="border-l-0 border-t-0 border-r-0 rounded-none focus-visible:ring-0"
                    />
                    : <p>{category}</p>
                }
                <div className="flex gap-2 items-center">
                    <TooltipContainer tooltipText={editingCategory === index ? t('save') : t('edit')}>
                        <span
                            className={cn("cursor-pointer", editingCategory === undefined ? 'text-blue-600' : (actionDisabled ? disabledClassName : 'text-green-600'))}
                            onClick={handleClick}
                        >
                            {editingCategory === index ? <Check className="size-4" /> : <Pencil className="size-4" />}
                        </span>
                    </TooltipContainer>
                    {editingCategory === index && (
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

export default CategoryRow;