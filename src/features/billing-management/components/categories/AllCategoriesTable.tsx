'use client'

import { Loader } from "lucide-react";
import { useGetBillingOptions } from "../../api/use-get-billing-options";
import { useMemo } from "react";
import CategoriesList from "./CategoriesList";
import { useUpdateBillingOptions } from "../../api/use-update-billing-options";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const AllCategoriesTable = () => {
    const { data, isLoading: isLoadingCategories } = useGetBillingOptions();
    const {mutate: updateCategories} = useUpdateBillingOptions();
    const t = useTranslations('billing')

    const incomeCategories = useMemo<string[]>(() => data?.documents[0]?.incomeCategories || [], [data])
    const expenseCategories = useMemo<string[]>(() => data?.documents[0]?.expenseCategories || [], [data])

    const allCategories = useMemo(() => [
        {header: 'income-categories', categories: incomeCategories, type: 'income' as const},
        {header: 'expense-categories', categories: expenseCategories, type: 'expense' as const}
    ], [incomeCategories, expenseCategories]);

    if (isLoadingCategories) return (
        <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
            <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
    )

    const normalizeCategory = (value: string) => value.trim().toLowerCase();

    const toUniqueCategories = (list: string[]) => {
        const seen = new Set<string>();

        return list.filter((item) => {
            const normalizedItem = normalizeCategory(item);

            if (!normalizedItem || seen.has(normalizedItem)) {
                return false;
            }

            seen.add(normalizedItem);
            return true;
        });
    }

    const handleAddCategory = (type: 'income' | 'expense', categoryName: string) => {
        const trimmedCategory = categoryName.trim();

        if (!trimmedCategory) {
            toast.error(t('category-required'));
            return false;
        }

        const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

        const alreadyExists = currentCategories.some((category: string) => normalizeCategory(category) === normalizeCategory(trimmedCategory));

        if (alreadyExists) {
            toast.error(t('category-duplicate-error'));
            return false;
        }

        const nextCategories = toUniqueCategories([...currentCategories, trimmedCategory]);


        const payload = {
            incomeCategories,
            expenseCategories,
            [`${type}Categories`]: nextCategories,
        };

        updateCategories({
            json: payload,
            param: { billingOptionId: data?.documents[0].$id || '' }
        })

        return true;
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {allCategories.map((category) => (
                    <CategoriesList
                        key={category.header}
                        header={category.header}
                        categories={category.categories}
                        type={category.type}
                        onAddCategory={handleAddCategory}
                    />
                ))}
            </div>
        </div>
    );
}

export default AllCategoriesTable;