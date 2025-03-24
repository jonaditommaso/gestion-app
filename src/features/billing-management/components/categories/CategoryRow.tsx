import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, Pencil, Trash2, XIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface CategoryRowProps {
    category: string,
    index: number,
    actionDisabled: boolean,
    setEditingCategory: Dispatch<SetStateAction<number | undefined>>,
    editingCategory: number | undefined
}

const disabledClassName = 'text-zinc-200 cursor-default pointer-events-none'

const CategoryRow = ({ category, index, actionDisabled, setEditingCategory, editingCategory }: CategoryRowProps) => {

    const handleClick = () => {
        setEditingCategory(index)
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
                    <span className="cursor-pointer text-red-600"><Trash2 className="size-4" /></span>
                </div>
            </TableCell>
        </TableRow>
    );
}

export default CategoryRow;