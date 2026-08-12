'use client'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import CategoryRow from "./CategoryRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CategoriesListProps {
    categories: string[],
    header: string,
    type: 'income' | 'expense',
    onAddCategory: (type: 'income' | 'expense', categoryName: string) => boolean,
}

const CategoriesList = ({ categories, header, type, onAddCategory }: CategoriesListProps) => {
    const [editingCategory, setEditingCategory] = useState<undefined | number>(undefined);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const t = useTranslations('billing');
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);
    const { isDemo } = useAppContext();

    const handleAdd = () => {
        const added = onAddCategory(type, newCategory);
        if (!added) return;

        setIsAdding(false);
        setNewCategory('');
    }

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewCategory('');
    }

    return (
        <Card className="h-full border-border/70 shadow-sm">
            <CardContent className="p-0">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-full px-3 py-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={cn("font-semibold", type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>{t(header)}</span>
                                    {canWrite && !isDemo && (
                                        <Button
                                            className="h-8 text-gray-700"
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsAdding(true)}
                                            disabled={isAdding}
                                        >
                                            <Plus className="h-[1rem] w-[1rem]" />
                                        </Button>
                                    )}
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isAdding && canWrite && !isDemo && (
                            <TableRow className="border-b bg-muted/10">
                                <TableCell className="px-3 py-2">
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            placeholder={t('new-category')}
                                            value={newCategory}
                                            onChange={(event) => setNewCategory(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                    handleAdd();
                                                }

                                                if (event.key === 'Escape') {
                                                    handleCancelAdd();
                                                }
                                            }}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button type="button" size="sm" onClick={handleAdd}>{t('add')}</Button>
                                            <Button type="button" size="sm" variant="ghost" onClick={handleCancelAdd}>{t('cancel')}</Button>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

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
            </CardContent>
        </Card>
    );
}

export default CategoriesList;