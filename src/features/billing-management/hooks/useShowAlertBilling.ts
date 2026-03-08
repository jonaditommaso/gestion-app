import { useMemo } from "react";
import { useGetOperations } from "../api/use-get-operations";
import { useGetBillingOptions } from "../api/use-get-billing-options";
import { useGetDrafts } from "../api/use-get-drafts";
import { useGetArchived } from "../api/use-get-archived";
import { ViewType } from "../types";

export const useShowAlertBilling = (currentView: string) => {
    const { data: operationsData } = useGetOperations();
    const { data: categoriesData } = useGetBillingOptions();
    const { data: draftsData } = useGetDrafts();
    const { data: archivedData } = useGetArchived();

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

    const hasDrafts = (draftsData?.total ?? 0) > 0;
    const hasArchived = (archivedData?.total ?? 0) > 0;

    const shouldShowAlert: Record<ViewType, boolean> = {
        details: !hasOperations,
        calendar: !hasOperations,
        followup: !hasFollowupData,
        categories: !hasCategories,
        incomes: !hasIncomes,
        expenses: !hasExpenses,
        drafts: !hasDrafts,
        archived: !hasArchived,
    };

    const showAlert = shouldShowAlert[currentView as ViewType] ?? false;

    return { showAlert };
}
