'use client'

import { Loader } from "lucide-react";
import { useGetBillingOptions } from "../../api/use-get-billing-options";
import { FormEvent, useMemo, useState } from "react";
import CategoriesList from "./CategoriesList";
import { useUpdateBillingOptions } from "../../api/use-update-billing-options";
import { DialogContainer } from "@/components/DialogContainer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const AllCategoriesTable = () => {
    const { data, isLoading: isLoadingCategories } = useGetBillingOptions();
    const {mutate: updateCategories} = useUpdateBillingOptions();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [typeToChange, setTypeToChange] = useState<null | string>(null);
    const t = useTranslations('billing')

    const incomeCategories = useMemo(() => data?.documents[0]?.incomeCategories || [], [data])
    const expenseCategories = useMemo(() => data?.documents[0]?.expenseCategories || [], [data])

    const allCategories = useMemo(() => [
        {header: 'income-categories', categories: incomeCategories, type: 'income'},
        {header: 'expense-categories', categories: expenseCategories, type: 'expense'}
    ], [incomeCategories, expenseCategories]);

    if (isLoadingCategories) return (
        <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
            <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
    )

    const onAddCategory = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { elements } = event.currentTarget

        const categoryInput = elements.namedItem('newCategory');

        const isInput = categoryInput instanceof HTMLInputElement;
        if (!isInput || isInput == null) return;

        const current = typeToChange === 'income' ? incomeCategories : expenseCategories;

        const payload = {
            incomeCategories,
            expenseCategories,
            [`${typeToChange}Categories`]: [...current, categoryInput.value],
        };

        updateCategories({
            json: payload,
            param: { billingOptionId: data?.documents[0].$id || '' }
        })

        categoryInput.value = ''
        setModalIsOpen(false);
    }

    const handleOpenModal = (type: string) => {
        setModalIsOpen(true);
        setTypeToChange(type);
    }

    return (
        <div className="flex gap-2">
            {/* move this dialog to split it according to permissions */}
            <DialogContainer
                title={t('add-category')}
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
            >
                <form onSubmit={onAddCategory}>
                    <div className="flex flex-col gap-4">
                        <Input name="newCategory" />
                        <Button className="w-[100%]" type="submit">
                            {t('add')}
                        </Button>
                    </div>
                </form>
            </DialogContainer>
            {allCategories.map(category => (
                <CategoriesList
                    key={category.header}
                    header={category.header}
                    categories={category.categories}
                    type={category.type}
                    handleOpenModal={handleOpenModal}
                />
            ))}
        </div>
    );
}

export default AllCategoriesTable;