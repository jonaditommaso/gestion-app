'use client'
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import CategoryRow from "./CategoryRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CategoriesListProps {
    categories: string[],
    header: string,
    type: string,
    handleOpenModal: (type: string) => void,
}

const CategoriesList = ({ categories, header, type, handleOpenModal }: CategoriesListProps) => {
    const [editingCategory, setEditingCategory] = useState<undefined | number>(undefined);
    const t = useTranslations('billing')

    return (
        <Table className="border p-4 min-w-[450px]">
            <TableHeader>
            <TableRow>
                <TableHead className={cn("font-semibold text-center grid grid-cols-4 items-center w-[100%]", type === 'income' ? 'text-green-600' : 'text-red-600')}>
                    <span className="col-span-3 ml-8">{t(header)}</span>
                    <span className="col-span-1 text-end">
                        <Button className="h-[30px] text-gray-700" type="button" variant="outline" size="icon" onClick={() => handleOpenModal(type)}>
                            <Plus className="h-[1rem] w-[1rem]" />
                        </Button>
                    </span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {categories?.map((category: string, index: number) => (
                <CategoryRow
                    key={category}
                    category={category}
                    index={index}
                    actionDisabled={editingCategory !== undefined && editingCategory !== index}
                    setEditingCategory={setEditingCategory}
                    editingCategory={editingCategory}
                    type={type}
                />
            ))}
            </TableBody>
        </Table>
    );
}

export default CategoriesList;