'use client'

import { Loader } from "lucide-react";
import { useGetBillingOptions } from "../../api/use-get-billing-options";
import { useMemo } from "react";
import CategoriesList from "./CategoriesList";

const AllCategoriesTable = () => {
    const { data, isLoading: isLoadingCategories } = useGetBillingOptions()

    if (isLoadingCategories) return (
        <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
            <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
    )

    const incomeCategories = data?.documents[0].incomeCategories || []
    const expenseCategories = data?.documents[0].expenseCategories || []

    const allCategories = useMemo(() => [
        {header: 'Income categories', categories: incomeCategories},
        {header: 'Expense categories', categories: expenseCategories}
    ], [incomeCategories, expenseCategories]);

    return (
        <div className="flex gap-2">
            {allCategories.map(category => (
                <CategoriesList
                    key={category.header}
                    header={category.header}
                    categories={category.categories}
                />
            ))}
        </div>
    );
}

export default AllCategoriesTable;