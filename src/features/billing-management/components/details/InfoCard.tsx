import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChartLine, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface InfoCardProps {
    numberMoney: number,
    type: 'incomes' | 'expenses' | 'total' | 'projection',
    comparisonPercent: number,
}

const types = {
    incomes: {
        icon: TrendingUp,
        color: '#0bb314',
        id: 'income',
        message: 'see-incomes'
    },
    expenses: {
        icon: TrendingDown,
        color: '#f03410',
        id: 'expense',
        message: 'see-expenses'
    },
    total: {
        icon: Scale,
        color: '#3f51b5',
        id: 'total',
        message: 'see-total'
    },
    projection: {
        icon: ChartLine,
        color: '#7c3aed',
        id: 'projection',
        message: 'see-projection'
    }
}

const InfoCard = ({ numberMoney, type, comparisonPercent }: InfoCardProps) => {
    const t = useTranslations('billing')
    const Icon = types[type].icon;
    const iconColor = types[type].color;

    const roundedComparison = Number.isFinite(comparisonPercent) ? Math.round(comparisonPercent) : 0;

    const comparisonLabel = (() => {
        if (roundedComparison === 0) return '0%';
        const arrow = roundedComparison > 0 ? '↑' : '↓';
        return `${arrow} ${Math.abs(roundedComparison)}%`;
    })();

    const comparisonClassName = (() => {
        if (roundedComparison === 0) {
            return 'text-zinc-600 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800/70';
        }

        if (type === 'expenses') {
            return roundedComparison > 0
                ? 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30'
                : 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30';
        }

        return roundedComparison > 0
            ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30'
            : 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30';
    })();

    return (
        <Card className="w-full min-h-32 border-border/80 bg-gradient-to-br from-background to-muted/30 transition shadow-md">
            <CardContent className="flex h-full flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t(types[type].message)}
                    </span>
                    <span
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${iconColor}24` }}
                    >
                        <Icon className="size-4" style={{ color: iconColor }} />
                    </span>
                </div>

                <p className="text-2xl font-semibold tracking-tight md:text-3xl">
                    <span className="mr-1 text-base text-muted-foreground">€</span>
                    {Number(numberMoney).toFixed(2)}
                </p>

                <div className="flex justify-end">
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', comparisonClassName)}>
                        {comparisonLabel}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default InfoCard;