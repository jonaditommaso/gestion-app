'use client'
import { Loader } from "lucide-react";
import { useGetOperations } from "../../api/use-get-operations";
import { generateColorFromPalette } from "@/lib/utils";
import { StatsPieChart } from "./StatsPieChart";
import StatsCategoriesList from "./StatsCategoriesList";

interface OperationStatsProps {
    type: 'incomes' | 'expenses'
}

const OperationStats = ({ type }: OperationStatsProps) => {
  const { data, isLoading } = useGetOperations();

    if (isLoading) return (
        <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
            <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
    )

    if (data?.total === 0) return 'No hay datos disponibles'

    const result = Object.groupBy(data?.documents!, ({ type }) =>
        type === 'income' ? "incomes" : "expenses",
    );

    const incomeStats = (result[type] || []).toSorted((a, b) => b.import - a.import).map((element, index) => {
        return {
            category: element.category,
            import: element.import,
            fill: generateColorFromPalette(index)
        }
    });


    return (
        <div className="flex flex-col lg:flex-row gap-5 justify-around sm:flex-col">
            <StatsCategoriesList categoriesData={incomeStats} />
            <StatsPieChart categoriesData={incomeStats} type={type} />
        </div>
    );
}

export default OperationStats;