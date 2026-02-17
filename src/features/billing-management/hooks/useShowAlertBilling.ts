import { useMemo } from "react";
import { useGetOperations } from "../api/use-get-operations";
import { useGetBillingOptions } from "../api/use-get-billing-options";
import { ViewType } from "../types";

export const useShowAlertBilling = (currentView: string) => {
    const { data: operationsData } = useGetOperations();
    const { data: categoriesData } = useGetBillingOptions();

    const hasOperations = (operationsData?.total ?? 0) > 0;

    const hasIncomes = useMemo(() =>
        operationsData?.documents?.some(op => op.type === 'income') ?? false
        , [operationsData]);

    const hasExpenses = useMemo(() =>
        operationsData?.documents?.some(op => op.type === 'expense') ?? false
        , [operationsData]);

    const hasCategories = useMemo(() => {
        const incomeCategories = categoriesData?.documents?.[0]?.incomeCategories ?? [];
        const expenseCategories = categoriesData?.documents?.[0]?.expenseCategories ?? [];
        return incomeCategories.length > 0 || expenseCategories.length > 0;
    }, [categoriesData]);

    const hasFollowupData = useMemo(() =>
        operationsData?.documents?.some(op => op.status === 'PENDING' || op.status === 'OVERDUE' || op.status === 'PAID') ?? false
        , [operationsData]);

    const shouldShowAlert: Record<ViewType, boolean> = {
        details: !hasOperations,
        calendar: !hasOperations,
        followup: !hasFollowupData,
        categories: !hasCategories,
        incomes: !hasIncomes,
        expenses: !hasExpenses
    };

    const showAlert = shouldShowAlert[currentView as ViewType] ?? false;

    return { showAlert };
}
