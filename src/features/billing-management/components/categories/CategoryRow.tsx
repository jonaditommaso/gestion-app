import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, Pencil, Trash2, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useGetBillingOptions } from "../../api/use-get-billing-options";
import { useUpdateBillingOptions } from "../../api/use-update-billing-options";

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
    const {mutate: updateCategories} = useUpdateBillingOptions()
    const [popoverIsOpen, setPopoverIsOpen] = useState(false)

    const handleClick = () => {
        setEditingCategory(index)
    }

    const handleDelete = () => {
        const incomeCategories = data?.documents[0].incomeCategories || []
        const expenseCategories = data?.documents[0].expenseCategories || []

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


    return (
        <TableRow key={category}>
            <TableCell className="flex items-center justify-between">
                {editingCategory === index
                ? <Input placeholder="Nueva categoria..." value={''} className="border-l-0 border-t-0 border-r-0 rounded-none focus-visible:ring-0" />
                : <p>{category}</p>
                }
                <div className="flex gap-2 items-center">
                    <span
                        className={cn("cursor-pointer", editingCategory === undefined ? 'text-blue-600' : (actionDisabled ? disabledClassName : 'text-green-600'))}
                        onClick={handleClick}
                    >
                        {editingCategory === index ? <Check className="size-4" /> : <Pencil className="size-4" />}
                    </span>
                    {/* <span className="cursor-pointer text-red-600"><XIcon className="size-4" /></span> */}
                    <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                        <PopoverTrigger asChild>
                            <span className="cursor-pointer text-red-600"><Trash2 className="size-4" /></span>
                        </PopoverTrigger>
                        <PopoverContent>
                            <p className="text-sm text-balance text-center">Are you sure you want to delete this category?</p>
                            <Separator className="my-2"/>
                            <div className="flex items-center gap-2 justify-center">
                                <Button variant='outline' size='sm' onClick={() => setPopoverIsOpen(false)}>Cancelar</Button>
                                <Button variant='destructive' size='sm' onClick={handleDelete}>Eliminar</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </TableCell>
        </TableRow>
    );
}

export default CategoryRow;