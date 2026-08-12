'use client'
import { Loader } from "lucide-react";
import { useGetOperations } from "../../api/use-get-operations";
import { generateColorFromPalette } from "@/lib/utils";
import { StatsPieChart } from "./StatsPieChart";
import StatsCategoriesList from "./StatsCategoriesList";
import NoData from "@/components/NoData";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OperationStatsProps {
    type: 'incomes' | 'expenses'
}

const OperationStats = ({ type }: OperationStatsProps) => {
    const { data, isLoading } = useGetOperations();
    const t = useTranslations('billing');

    if (isLoading) return (
        <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
            <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
    )

    const result = data && Object.groupBy(data?.documents, ({ type }) =>
        type === 'income' ? "incomes" : "expenses",
    ) || {};

    const stats = (result[type] || []).toSorted((a, b) => b.import - a.import).map((element, index) => {
        return {
            category: element.category,
            import: element.import,
            fill: generateColorFromPalette(index)
        }
    });

    // Show NoData if there are no operations for this specific type
    if (stats.length === 0) return (
        <div className="w-full max-w-[800px]">
            <NoData
                title={type === 'incomes' ? "no-incomes-data" : "no-expenses-data"}
                description={type === 'incomes' ? "add-income-operation" : "add-expense-operation"}
            />
        </div>
    )

    const totalAmount = stats.reduce((acc, element) => acc + element.import, 0);
    const topCategory = stats[0]?.category || '-';

    return (
        <Card className="w-full border-border/80 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                    <CardTitle className="text-base">{t(type)}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        € {totalAmount.toFixed(2)}
                    </div>
                </div>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground md:flex-row md:gap-4">
                    <span>{t('top-category')}: {topCategory}</span>
                    <span>{t('categories-count')}: {stats.length}</span>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <StatsPieChart categoriesData={stats} type={type} />
                </div>
                <div className="lg:col-span-2">
                    <StatsCategoriesList categoriesData={stats} />
                </div>
            </CardContent>
        </Card>
    );
}

export default OperationStats;