'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowRight,
    ArrowUpRight,
    CalendarClock,
    CalendarRange,
    CircleDollarSign,
    CircleSmall,
    Download,
    FileText,
    Layers2,
    Lightbulb,
    Link2,
    Minus,
    ReceiptText,
    Rocket,
    Share2,
    Sparkles,
    TrendingDown,
    TrendingUp,
    LayerArrowDown,
    LayerArrowUp,
    CirclePile,
} from "lucide-react";
import {
    Cell,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    // SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import CustomDatePicker from "@/components/CustomDatePicker";
import NoData from "@/components/NoData";
import { DialogContainer } from "@/components/DialogContainer";
import { cn } from "@/lib/utils";
import { useGetOperations } from "../../api/use-get-operations";
import { useGetBillingOptions } from "../../api/use-get-billing-options";

type BillingStatus = 'PENDING' | 'PAID' | 'OVERDUE';
type BillingType = 'income' | 'expense';
type PeriodFilter = '6m' | '12m' | 'ytd' | 'custom';
type CompareMode = 'previous' | 'yoy' | 'budget';
type TypeFilter = 'both' | BillingType;
type TrendType = 'growing' | 'decreasing' | 'stable';

interface BillingOperation {
    $id: string;
    type: BillingType;
    category: string;
    import: number;
    status?: BillingStatus;
    date: string | Date;
    dueDate?: string | Date;
    isArchived?: boolean;
    isDraft?: boolean;
}

interface BillingOptionsDocument {
    incomeCategories?: string[];
    expenseCategories?: string[];
}

interface DateRange {
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
}

interface SummaryValues {
    incomes: number;
    expenses: number;
    balance: number;
    gross: number;
    operations: number;
}

interface MonthlyPoint {
    monthKey: string;
    monthLabel: string;
    incomes: number;
    expenses: number;
    balance: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
}

interface CategoryRow {
    category: string;
    amount: number;
    previousAmount: number;
    share: number;
    variation: number;
    operations: number;
}

interface TrendRow {
    category: string;
    trend: TrendType;
    variation: number;
    streak: number;
    context: string;
}

interface InsightItem {
    id: string;
    tone: 'positive' | 'warning' | 'neutral';
    text: string;
    actionLabel?: string;
    onAction?: () => void;
}

interface ProjectionPoint {
    monthKey: string;
    monthLabel: string;
    incomes: number;
    expenses: number;
    balance: number;
}

interface DonutSlice {
    category: string;
    amount: number;
    share: number;
    fill: string;
}

interface InsightDetailState {
    title: string;
    description: string;
    highlights: string[];
    primaryLabel?: string;
    onPrimary?: () => void;
}

interface ActionPlanState {
    title: string;
    reason: string;
    highlights: string[];
    steps: string[];
    primaryLabel?: string;
    onPrimary?: () => void;
}

const QUICK_DONUT_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--muted-foreground))',
];

const calculateVariation = (currentValue: number, previousValue: number): number => {
    if (previousValue === 0) {
        if (currentValue === 0) return 0;
        return currentValue > 0 ? 100 : -100;
    }

    const variation = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    return Number.isFinite(variation) ? variation : 0;
};

const clampPercentage = (value: number): number => {
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
};

const renderTypeFilterIcon = (value: TypeFilter, className = 'h-4 w-4') => {
    if (value === 'income') {
        return <LayerArrowDown className={cn(className, 'text-emerald-500')} />;
    }

    if (value === 'expense') {
        return <LayerArrowUp className={cn(className, 'text-rose-500')} />;
    }

    return <Layers2 className={cn(className, 'text-sky-500')} />;
};

const renderPeriodFilterIcon = (className = 'h-4 w-4') => {
    return <CalendarRange className={cn(className, 'text-violet-500')} />;
};

const renderComparisonModeIcon = (value: CompareMode, className = 'h-4 w-4') => {
    if (value === 'yoy') {
        return <ArrowLeftRight className={cn(className, 'text-indigo-500')} />;
    }

    if (value === 'budget') {
        return <CircleDollarSign className={cn(className, 'text-amber-500')} />;
    }

    return <CalendarRange className={cn(className, 'text-violet-500')} />;
};

const sumByType = (operations: BillingOperation[], type: BillingType): number => {
    return operations
        .filter((operation) => operation.type === type)
        .reduce((accumulator, operation) => accumulator + operation.import, 0);
};

const summarize = (operations: BillingOperation[]): SummaryValues => {
    const incomes = sumByType(operations, 'income');
    const expenses = sumByType(operations, 'expense');

    return {
        incomes,
        expenses,
        balance: incomes - expenses,
        gross: incomes + expenses,
        operations: operations.length,
    };
};

const BillingAnalyticsWorkspace = () => {
    const t = useTranslations('billing');
    const locale = useLocale();
    const router = useRouter();
    const { data } = useGetOperations();
    const { data: optionsData } = useGetBillingOptions();

    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('6m');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('both');
    const [comparisonMode, setComparisonMode] = useState<CompareMode>('previous');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
    const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
    const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedCategoryType, setSelectedCategoryType] = useState<TypeFilter>('both');
    const [isInsightDetailOpen, setIsInsightDetailOpen] = useState(false);
    const [insightDetail, setInsightDetail] = useState<InsightDetailState | null>(null);
    const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
    const [actionPlan, setActionPlan] = useState<ActionPlanState | null>(null);
    const [visibleSeries, setVisibleSeries] = useState({
        incomes: true,
        expenses: true,
        balance: true,
    });

    const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long' }), [locale]);
    const monthYearFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }), [locale]);

    const moneyFormatter = useMemo(() => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        });
    }, [locale]);

    const percentFormatter = useMemo(() => {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        });
    }, [locale]);

    const operations = useMemo(() => (data?.documents || []) as unknown as BillingOperation[], [data]);
    const optionsDoc = useMemo(() => (optionsData?.documents?.[0] || {}) as BillingOptionsDocument, [optionsData]);

    const activeOperations = useMemo(() => {
        return operations.filter((operation) => operation.isArchived !== true && operation.isDraft !== true);
    }, [operations]);

    const incomeCategories = useMemo(() => optionsDoc.incomeCategories || [], [optionsDoc]);
    const expenseCategories = useMemo(() => optionsDoc.expenseCategories || [], [optionsDoc]);

    const availableCategories = useMemo(() => {
        const values: string[] = [];

        if (typeFilter === 'income') {
            values.push(...incomeCategories);
        } else if (typeFilter === 'expense') {
            values.push(...expenseCategories);
        } else {
            values.push(...incomeCategories, ...expenseCategories);
        }

        activeOperations.forEach((operation) => {
            if (typeFilter !== 'both' && operation.type !== typeFilter) {
                return;
            }

            values.push(operation.category);
        });

        return Array.from(new Set(values)).filter(Boolean).toSorted((a, b) => a.localeCompare(b));
    }, [activeOperations, expenseCategories, incomeCategories, typeFilter]);

    const buildQuickDonutSlices = useCallback((type: BillingType): DonutSlice[] => {
        const amountsByCategory = new Map<string, number>();

        activeOperations.forEach((operation) => {
            if (operation.type !== type) {
                return;
            }

            const currentAmount = amountsByCategory.get(operation.category) || 0;
            amountsByCategory.set(operation.category, currentAmount + operation.import);
        });

        const sortedEntries = Array.from(amountsByCategory.entries())
            .map(([category, amount]) => ({ category, amount }))
            .toSorted((a, b) => b.amount - a.amount);

        const topEntries = sortedEntries.slice(0, 5);
        const othersAmount = sortedEntries
            .slice(5)
            .reduce((accumulator, entry) => accumulator + entry.amount, 0);

        if (othersAmount > 0) {
            topEntries.push({
                category: t('other'),
                amount: othersAmount,
            });
        }

        const totalAmount = topEntries.reduce((accumulator, entry) => accumulator + entry.amount, 0);

        return topEntries.map((entry, index) => ({
            category: entry.category,
            amount: entry.amount,
            share: totalAmount > 0 ? (entry.amount / totalAmount) * 100 : 0,
            fill: QUICK_DONUT_COLORS[index % QUICK_DONUT_COLORS.length],
        }));
    }, [activeOperations, t]);

    const quickIncomeDonut = useMemo(() => buildQuickDonutSlices('income'), [buildQuickDonutSlices]);
    const quickExpenseDonut = useMemo(() => buildQuickDonutSlices('expense'), [buildQuickDonutSlices]);

    useEffect(() => {
        if (categoryFilter !== 'ALL' && !availableCategories.includes(categoryFilter)) {
            setCategoryFilter('ALL');
        }
    }, [availableCategories, categoryFilter]);

    const currentRange = useMemo<DateRange>(() => {
        const today = dayjs();

        if (periodFilter === 'custom' && customFrom && customTo) {
            const start = dayjs(customFrom).startOf('day');
            const end = dayjs(customTo).endOf('day');

            if (start.isAfter(end)) {
                return {
                    start: end.startOf('day'),
                    end: start.endOf('day'),
                };
            }

            return { start, end };
        }

        if (periodFilter === '12m') {
            return {
                start: today.subtract(11, 'month').startOf('month'),
                end: today.endOf('month'),
            };
        }

        if (periodFilter === 'ytd') {
            return {
                start: today.startOf('year'),
                end: today.endOf('month'),
            };
        }

        return {
            start: today.subtract(5, 'month').startOf('month'),
            end: today.endOf('month'),
        };
    }, [customFrom, customTo, periodFilter]);

    const previousRange = useMemo<DateRange>(() => {
        const totalDays = currentRange.end.diff(currentRange.start, 'day') + 1;
        const end = currentRange.start.subtract(1, 'day').endOf('day');
        const start = end.subtract(totalDays - 1, 'day').startOf('day');

        return { start, end };
    }, [currentRange]);

    const comparisonRange = useMemo<DateRange>(() => {
        if (comparisonMode === 'yoy') {
            return {
                start: currentRange.start.subtract(1, 'year'),
                end: currentRange.end.subtract(1, 'year'),
            };
        }

        return previousRange;
    }, [comparisonMode, currentRange, previousRange]);

    const isBudgetFallback = comparisonMode === 'budget';

    const matchesTypeAndCategory = useCallback((operation: BillingOperation): boolean => {
        if (typeFilter !== 'both' && operation.type !== typeFilter) {
            return false;
        }

        if (categoryFilter !== 'ALL' && operation.category !== categoryFilter) {
            return false;
        }

        return true;
    }, [categoryFilter, typeFilter]);

    const filterByRange = useCallback((range: DateRange): BillingOperation[] => {
        return activeOperations.filter((operation) => {
            if (!matchesTypeAndCategory(operation)) {
                return false;
            }

            const operationDate = dayjs(operation.date);
            if (!operationDate.isValid()) {
                return false;
            }

            return (operationDate.isAfter(range.start) || operationDate.isSame(range.start, 'day'))
                && (operationDate.isBefore(range.end) || operationDate.isSame(range.end, 'day'));
        });
    }, [activeOperations, matchesTypeAndCategory]);

    const currentOperations = useMemo(() => filterByRange(currentRange), [currentRange, filterByRange]);
    const comparedOperations = useMemo(() => filterByRange(comparisonRange), [comparisonRange, filterByRange]);

    const currentSummary = useMemo(() => summarize(currentOperations), [currentOperations]);
    const comparedSummary = useMemo(() => summarize(comparedOperations), [comparedOperations]);

    const averageTicket = useMemo(() => {
        return currentSummary.operations > 0 ? currentSummary.gross / currentSummary.operations : 0;
    }, [currentSummary]);

    const comparedAverageTicket = useMemo(() => {
        return comparedSummary.operations > 0 ? comparedSummary.gross / comparedSummary.operations : 0;
    }, [comparedSummary]);

    const summaryVariation = useMemo(() => {
        return {
            incomes: calculateVariation(currentSummary.incomes, comparedSummary.incomes),
            expenses: calculateVariation(currentSummary.expenses, comparedSummary.expenses),
            balance: calculateVariation(currentSummary.balance, comparedSummary.balance),
            avgTicket: calculateVariation(averageTicket, comparedAverageTicket),
        };
    }, [averageTicket, comparedAverageTicket, comparedSummary, currentSummary]);

    const monthCursor = useMemo(() => {
        const months: dayjs.Dayjs[] = [];
        let cursor = currentRange.start.startOf('month');
        const endMonth = currentRange.end.startOf('month');

        while (cursor.isBefore(endMonth) || cursor.isSame(endMonth, 'month')) {
            months.push(cursor);
            cursor = cursor.add(1, 'month');
        }

        return months;
    }, [currentRange]);

    const monthlySeries = useMemo<MonthlyPoint[]>(() => {
        const showYear = monthCursor.length > 8;

        return monthCursor.map((monthDate) => {
            const monthOperations = currentOperations.filter((operation) => dayjs(operation.date).isSame(monthDate, 'month'));
            const incomeByCategory: Record<string, number> = {};
            const expenseByCategory: Record<string, number> = {};

            monthOperations.forEach((operation) => {
                if (operation.type === 'income') {
                    incomeByCategory[operation.category] = (incomeByCategory[operation.category] || 0) + operation.import;
                } else {
                    expenseByCategory[operation.category] = (expenseByCategory[operation.category] || 0) + operation.import;
                }
            });

            const incomes = sumByType(monthOperations, 'income');
            const expenses = sumByType(monthOperations, 'expense');

            return {
                monthKey: monthDate.format('YYYY-MM'),
                monthLabel: showYear
                    ? monthYearFormatter.format(monthDate.toDate())
                    : monthFormatter.format(monthDate.toDate()),
                incomes: Number(incomes.toFixed(2)),
                expenses: Number(expenses.toFixed(2)),
                balance: Number((incomes - expenses).toFixed(2)),
                incomeByCategory,
                expenseByCategory,
            };
        });
    }, [currentOperations, monthCursor, monthFormatter, monthYearFormatter]);

    useEffect(() => {
        if (!monthlySeries.length) {
            setSelectedMonthKey('');
            return;
        }

        const exists = monthlySeries.some((entry) => entry.monthKey === selectedMonthKey);
        if (!exists) {
            setSelectedMonthKey(monthlySeries[monthlySeries.length - 1].monthKey);
        }
    }, [monthlySeries, selectedMonthKey]);

    const selectedMonth = useMemo(() => {
        if (!monthlySeries.length) {
            return null;
        }

        return monthlySeries.find((entry) => entry.monthKey === selectedMonthKey) || monthlySeries[monthlySeries.length - 1];
    }, [monthlySeries, selectedMonthKey]);

    const selectedMonthExpenseDrivers = useMemo(() => {
        if (!selectedMonth) {
            return [];
        }

        const index = monthlySeries.findIndex((entry) => entry.monthKey === selectedMonth.monthKey);
        const previous = index > 0 ? monthlySeries[index - 1] : undefined;

        return Object.entries(selectedMonth.expenseByCategory)
            .map(([category, amount]) => {
                const previousAmount = previous?.expenseByCategory[category] || 0;
                return {
                    category,
                    amount,
                    difference: amount - previousAmount,
                    variation: calculateVariation(amount, previousAmount),
                };
            })
            .filter((entry) => entry.amount > 0)
            .toSorted((a, b) => b.difference - a.difference)
            .slice(0, 3);
    }, [monthlySeries, selectedMonth]);

    const buildCategoryRows = useCallback((type: BillingType): CategoryRow[] => {
        const currentMap = new Map<string, { amount: number; operations: number }>();
        const comparedMap = new Map<string, number>();

        currentOperations
            .filter((operation) => operation.type === type)
            .forEach((operation) => {
                const current = currentMap.get(operation.category) || { amount: 0, operations: 0 };
                currentMap.set(operation.category, {
                    amount: current.amount + operation.import,
                    operations: current.operations + 1,
                });
            });

        comparedOperations
            .filter((operation) => operation.type === type)
            .forEach((operation) => {
                comparedMap.set(operation.category, (comparedMap.get(operation.category) || 0) + operation.import);
            });

        const categories = new Set<string>([
            ...Array.from(currentMap.keys()),
            ...Array.from(comparedMap.keys()),
        ]);

        const totalAmount = Array.from(currentMap.values()).reduce((accumulator, row) => accumulator + row.amount, 0);

        return Array.from(categories)
            .map((category) => {
                const current = currentMap.get(category) || { amount: 0, operations: 0 };
                const previousAmount = comparedMap.get(category) || 0;

                return {
                    category,
                    amount: current.amount,
                    previousAmount,
                    share: totalAmount > 0 ? (current.amount / totalAmount) * 100 : 0,
                    variation: calculateVariation(current.amount, previousAmount),
                    operations: current.operations,
                };
            })
            .filter((row) => row.amount > 0)
            .toSorted((a, b) => b.amount - a.amount);
    }, [comparedOperations, currentOperations]);

    const incomeRows = useMemo(() => buildCategoryRows('income'), [buildCategoryRows]);
    const expenseRows = useMemo(() => buildCategoryRows('expense'), [buildCategoryRows]);

    const mergedRows = useMemo<CategoryRow[]>(() => {
        const currentMap = new Map<string, { amount: number; operations: number }>();
        const comparedMap = new Map<string, number>();

        currentOperations.forEach((operation) => {
            const current = currentMap.get(operation.category) || { amount: 0, operations: 0 };
            currentMap.set(operation.category, {
                amount: current.amount + operation.import,
                operations: current.operations + 1,
            });
        });

        comparedOperations.forEach((operation) => {
            comparedMap.set(operation.category, (comparedMap.get(operation.category) || 0) + operation.import);
        });

        const categories = new Set<string>([
            ...Array.from(currentMap.keys()),
            ...Array.from(comparedMap.keys()),
        ]);

        const totalAmount = Array.from(currentMap.values()).reduce((accumulator, row) => accumulator + row.amount, 0);

        return Array.from(categories)
            .map((category) => {
                const current = currentMap.get(category) || { amount: 0, operations: 0 };
                const previousAmount = comparedMap.get(category) || 0;

                return {
                    category,
                    amount: current.amount,
                    previousAmount,
                    share: totalAmount > 0 ? (current.amount / totalAmount) * 100 : 0,
                    variation: calculateVariation(current.amount, previousAmount),
                    operations: current.operations,
                };
            })
            .filter((row) => row.amount > 0)
            .toSorted((a, b) => b.amount - a.amount);
    }, [comparedOperations, currentOperations]);

    useEffect(() => {
        if (categoryFilter !== 'ALL') {
            setSelectedCategory(categoryFilter);
            setSelectedCategoryType(typeFilter);
            return;
        }

        if (selectedCategory && mergedRows.some((row) => row.category === selectedCategory)) {
            return;
        }

        const fallback = expenseRows[0]?.category || incomeRows[0]?.category || mergedRows[0]?.category || '';

        if (fallback) {
            setSelectedCategory(fallback);
            if (expenseRows[0]?.category === fallback) {
                setSelectedCategoryType('expense');
                return;
            }

            if (incomeRows[0]?.category === fallback) {
                setSelectedCategoryType('income');
                return;
            }

            setSelectedCategoryType(typeFilter);
        }
    }, [categoryFilter, expenseRows, incomeRows, mergedRows, selectedCategory, typeFilter]);

    const selectedCategoryRow = useMemo(() => {
        const source = selectedCategoryType === 'income'
            ? incomeRows
            : selectedCategoryType === 'expense'
                ? expenseRows
                : mergedRows;

        return source.find((row) => row.category === selectedCategory) || null;
    }, [expenseRows, incomeRows, mergedRows, selectedCategory, selectedCategoryType]);

    const selectedCategorySeries = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }

        return monthlySeries.map((entry) => {
            const amount = selectedCategoryType === 'income'
                ? (entry.incomeByCategory[selectedCategory] || 0)
                : selectedCategoryType === 'expense'
                    ? (entry.expenseByCategory[selectedCategory] || 0)
                    : (entry.incomeByCategory[selectedCategory] || 0) + (entry.expenseByCategory[selectedCategory] || 0);

            return {
                monthLabel: entry.monthLabel,
                amount: Number(amount.toFixed(2)),
            };
        });
    }, [monthlySeries, selectedCategory, selectedCategoryType]);

    const trendRows = useMemo<TrendRow[]>(() => {
        const source = typeFilter === 'income' ? incomeRows : typeFilter === 'expense' ? expenseRows : mergedRows;

        const countStreak = (series: number[]): number => {
            if (series.length < 2) return 0;

            let streak = 0;

            for (let index = series.length - 1; index > 0; index -= 1) {
                if (series[index] > series[index - 1] && series[index - 1] > 0) {
                    streak += 1;
                    continue;
                }

                break;
            }

            return streak;
        };

        return source
            .map((row) => {
                const monthValues = monthlySeries.map((entry) => {
                    if (typeFilter === 'income') {
                        return entry.incomeByCategory[row.category] || 0;
                    }

                    if (typeFilter === 'expense') {
                        return entry.expenseByCategory[row.category] || 0;
                    }

                    return (entry.incomeByCategory[row.category] || 0) + (entry.expenseByCategory[row.category] || 0);
                });

                const streak = countStreak(monthValues);

                let trend: TrendType = 'stable';
                if (row.variation > 8) trend = 'growing';
                if (row.variation < -8) trend = 'decreasing';

                const context = streak >= 3
                    ? t('trend-context-streak', { category: row.category, count: streak + 1 })
                    : t('trend-context-variation', {
                        category: row.category,
                        value: `${row.variation >= 0 ? '+' : '-'}${percentFormatter.format(Math.abs(row.variation))}%`,
                    });

                return {
                    category: row.category,
                    trend,
                    variation: row.variation,
                    streak,
                    context,
                };
            })
            .toSorted((a, b) => Math.abs(b.variation) - Math.abs(a.variation))
            .slice(0, 6);
    }, [expenseRows, incomeRows, mergedRows, monthlySeries, percentFormatter, t, typeFilter]);

    const receivableOperations = useMemo(() => {
        return currentOperations.filter((operation) => operation.type === 'income' && (operation.status || 'PENDING') !== 'PAID');
    }, [currentOperations]);

    const receivables = useMemo(() => {
        const todayStart = dayjs().startOf('day');
        const dueSoonLimit = dayjs().add(30, 'day').endOf('day');

        const overdue = receivableOperations.filter((operation) => operation.dueDate && dayjs(operation.dueDate).isBefore(todayStart));
        const dueSoon = receivableOperations.filter((operation) => {
            if (!operation.dueDate) return false;

            const dueDate = dayjs(operation.dueDate);
            return (dueDate.isAfter(todayStart) || dueDate.isSame(todayStart, 'day'))
                && (dueDate.isBefore(dueSoonLimit) || dueDate.isSame(dueSoonLimit, 'day'));
        });

        const pendingTotal = receivableOperations.reduce((accumulator, operation) => accumulator + operation.import, 0);
        const overdueTotal = overdue.reduce((accumulator, operation) => accumulator + operation.import, 0);
        const dueSoonTotal = dueSoon.reduce((accumulator, operation) => accumulator + operation.import, 0);

        const aging = {
            bucket0to30: 0,
            bucket31to60: 0,
            bucket61to90: 0,
            bucket90plus: 0,
        };

        overdue.forEach((operation) => {
            const overdueDays = dayjs().diff(dayjs(operation.dueDate), 'day');

            if (overdueDays <= 30) {
                aging.bucket0to30 += operation.import;
                return;
            }

            if (overdueDays <= 60) {
                aging.bucket31to60 += operation.import;
                return;
            }

            if (overdueDays <= 90) {
                aging.bucket61to90 += operation.import;
                return;
            }

            aging.bucket90plus += operation.import;
        });

        return {
            pendingTotal,
            overdueTotal,
            dueSoonTotal,
            aging,
        };
    }, [receivableOperations]);

    const projectionBase = useMemo(() => {
        if (monthlySeries.length >= 4) {
            return monthlySeries;
        }

        const fallbackRange: DateRange = {
            start: dayjs().subtract(5, 'month').startOf('month'),
            end: dayjs().endOf('month'),
        };

        const fallbackMonths: dayjs.Dayjs[] = [];
        let cursor = fallbackRange.start;
        const endMonth = fallbackRange.end.startOf('month');

        while (cursor.isBefore(endMonth) || cursor.isSame(endMonth, 'month')) {
            fallbackMonths.push(cursor);
            cursor = cursor.add(1, 'month');
        }

        const fallbackOperations = activeOperations.filter((operation) => {
            if (!matchesTypeAndCategory(operation)) {
                return false;
            }

            const operationDate = dayjs(operation.date);
            if (!operationDate.isValid()) return false;

            return (operationDate.isAfter(fallbackRange.start) || operationDate.isSame(fallbackRange.start, 'day'))
                && (operationDate.isBefore(fallbackRange.end) || operationDate.isSame(fallbackRange.end, 'day'));
        });

        return fallbackMonths.map((monthDate) => {
            const monthOperations = fallbackOperations.filter((operation) => dayjs(operation.date).isSame(monthDate, 'month'));
            const incomes = sumByType(monthOperations, 'income');
            const expenses = sumByType(monthOperations, 'expense');

            return {
                monthKey: monthDate.format('YYYY-MM'),
                monthLabel: monthFormatter.format(monthDate.toDate()),
                incomes,
                expenses,
                balance: incomes - expenses,
                incomeByCategory: {},
                expenseByCategory: {},
            };
        });
    }, [activeOperations, matchesTypeAndCategory, monthFormatter, monthlySeries]);

    const projection = useMemo(() => {
        const recent = projectionBase.slice(-4);

        const averageDelta = (series: number[]): number => {
            if (series.length < 2) return 0;

            const deltas: number[] = [];
            for (let index = 1; index < series.length; index += 1) {
                deltas.push(series[index] - series[index - 1]);
            }

            return deltas.reduce((accumulator, value) => accumulator + value, 0) / deltas.length;
        };

        const incomeDelta = averageDelta(recent.map((entry) => entry.incomes));
        const expenseDelta = averageDelta(recent.map((entry) => entry.expenses));

        const latest = recent[recent.length - 1] || {
            monthKey: dayjs().format('YYYY-MM'),
            monthLabel: monthFormatter.format(dayjs().toDate()),
            incomes: 0,
            expenses: 0,
            balance: 0,
            incomeByCategory: {},
            expenseByCategory: {},
        };

        const projected: ProjectionPoint[] = Array.from({ length: 3 }).map((_, index) => {
            const monthDate = dayjs(`${latest.monthKey}-01`).add(index + 1, 'month');
            const incomes = Math.max(0, latest.incomes + incomeDelta * (index + 1));
            const expenses = Math.max(0, latest.expenses + expenseDelta * (index + 1));

            return {
                monthKey: monthDate.format('YYYY-MM'),
                monthLabel: monthFormatter.format(monthDate.toDate()),
                incomes: Number(incomes.toFixed(2)),
                expenses: Number(expenses.toFixed(2)),
                balance: Number((incomes - expenses).toFixed(2)),
            };
        });

        const chartData = [
            ...projectionBase.map((entry) => ({
                monthLabel: entry.monthLabel,
                historicalBalance: entry.balance,
                projectedBalance: null,
                historicalIncomes: entry.incomes,
                projectedIncomes: null,
                historicalExpenses: entry.expenses,
                projectedExpenses: null,
            })),
            ...projected.map((entry) => ({
                monthLabel: entry.monthLabel,
                historicalBalance: null,
                projectedBalance: entry.balance,
                historicalIncomes: null,
                projectedIncomes: entry.incomes,
                historicalExpenses: null,
                projectedExpenses: entry.expenses,
            })),
        ];

        const historicalLastBalance = projectionBase[projectionBase.length - 1]?.balance || 0;
        const projectedLastBalance = projected[projected.length - 1]?.balance || 0;

        return {
            projected,
            chartData,
            balanceDrop: calculateVariation(projectedLastBalance, historicalLastBalance),
            finalProjectedMonth: projected[projected.length - 1]?.monthLabel || '',
        };
    }, [monthFormatter, projectionBase]);

    const openOperations = useCallback((filters: {
        type?: BillingType;
        status?: BillingStatus;
        category?: string;
        month?: string;
        focus?: 'overdue';
    }) => {
        const query = new URLSearchParams();
        query.set('view', 'operations');
        query.set('tab', 'table');

        if (filters.type) query.set('type', filters.type);
        if (filters.status) query.set('status', filters.status);
        if (filters.category) query.set('category', filters.category);
        if (filters.month) query.set('month', filters.month);
        if (filters.focus) query.set('focus', filters.focus);

        router.push(`/billing-management?${query.toString()}`);
    }, [router]);

    const comparisonLabel = useMemo(() => {
        if (comparisonMode === 'yoy') return t('comparison-same-period-last-year');
        if (comparisonMode === 'budget') return t('comparison-budget');
        return t('comparison-previous-period');
    }, [comparisonMode, t]);

    const periodLabel = useMemo(() => {
        if (periodFilter === '6m') return t('period-last-6-months');
        if (periodFilter === '12m') return t('period-last-12-months');
        if (periodFilter === 'ytd') return t('period-ytd');
        return t('period-custom');
    }, [periodFilter, t]);

    const scrollToCategoryDetail = useCallback(() => {
        const categoryDetailElement = document.getElementById('analytics-category-detail');

        if (!categoryDetailElement) {
            return;
        }

        categoryDetailElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, []);

    const openInsightDetail = useCallback((detail: InsightDetailState) => {
        setInsightDetail(detail);
        setIsInsightDetailOpen(true);
    }, []);

    const openActionPlan = useCallback((plan: ActionPlanState) => {
        setActionPlan(plan);
        setIsActionPlanOpen(true);
    }, []);

    const focusCategoryFromInsight = useCallback((category: string, type: TypeFilter) => {
        if (!category) {
            toast.error(t('no-category-data'));
            return;
        }

        setSelectedCategory(category);
        setSelectedCategoryType(type);
        scrollToCategoryDetail();
    }, [scrollToCategoryDetail, t]);

    const insights = useMemo<InsightItem[]>(() => {
        const list: InsightItem[] = [];

        if (Math.abs(summaryVariation.incomes) >= 8) {
            list.push({
                id: 'income',
                tone: summaryVariation.incomes >= 0 ? 'positive' : 'warning',
                text: summaryVariation.incomes >= 0
                    ? t('insight-income-up', { value: percentFormatter.format(summaryVariation.incomes), comparison: comparisonLabel })
                    : t('insight-income-down', { value: percentFormatter.format(Math.abs(summaryVariation.incomes)), comparison: comparisonLabel }),
                actionLabel: t('view-operations'),
                onAction: () => openOperations({ type: 'income', month: selectedMonth?.monthKey }),
            });
        }

        if (Math.abs(summaryVariation.expenses) >= 8) {
            const categories = expenseRows
                .filter((row) => row.variation > 0)
                .slice(0, 2)
                .map((row) => row.category)
                .join(', ');

            list.push({
                id: 'expenses',
                tone: summaryVariation.expenses > 0 ? 'warning' : 'positive',
                text: summaryVariation.expenses >= 0
                    ? t('insight-expense-up', {
                        value: percentFormatter.format(summaryVariation.expenses),
                        categories: categories || t('all-categories'),
                        comparison: comparisonLabel,
                    })
                    : t('insight-expense-down', {
                        value: percentFormatter.format(Math.abs(summaryVariation.expenses)),
                        comparison: comparisonLabel,
                    }),
                actionLabel: t('analyze-category'),
                onAction: () => {
                    const topExpense = expenseRows[0]?.category;
                    if (!topExpense) {
                        toast.error(t('no-category-data'));
                        return;
                    }

                    focusCategoryFromInsight(topExpense, 'expense');
                },
            });
        }

        if (receivables.pendingTotal > 0) {
            list.push({
                id: 'pending',
                tone: 'warning',
                text: t('insight-pending-amount', { value: moneyFormatter.format(receivables.pendingTotal) }),
                actionLabel: t('view-invoices'),
                onAction: () => openOperations({ type: 'income', status: 'PENDING' }),
            });
        }

        const trendCandidate = trendRows.find((row) => row.trend === 'growing' && row.streak >= 3);
        if (trendCandidate) {
            list.push({
                id: 'trend',
                tone: 'neutral',
                text: t('insight-category-streak', { category: trendCandidate.category, count: trendCandidate.streak + 1 }),
                actionLabel: t('analyze-category'),
                onAction: () => {
                    focusCategoryFromInsight(trendCandidate.category, typeFilter);
                },
            });
        }

        if (Math.abs(summaryVariation.avgTicket) >= 6) {
            list.push({
                id: 'ticket',
                tone: summaryVariation.avgTicket >= 0 ? 'positive' : 'warning',
                text: summaryVariation.avgTicket >= 0
                    ? t('insight-ticket-up', { value: percentFormatter.format(summaryVariation.avgTicket) })
                    : t('insight-ticket-down', { value: percentFormatter.format(Math.abs(summaryVariation.avgTicket)) }),
                actionLabel: t('view-details'),
                onAction: () => {
                    openInsightDetail({
                        title: t('insight-detail-title'),
                        description: t('insight-detail-description'),
                        highlights: [
                            `${t('period')}: ${periodLabel}`,
                            `${t('current-value')}: ${moneyFormatter.format(averageTicket)}`,
                            `${t('comparison')}: ${moneyFormatter.format(comparedAverageTicket)}`,
                            `${t('variation-vs-comparison')}: ${summaryVariation.avgTicket >= 0 ? '+' : '-'}${percentFormatter.format(Math.abs(summaryVariation.avgTicket))}%`,
                        ],
                        primaryLabel: t('view-operations'),
                        onPrimary: () => openOperations({
                            month: selectedMonth?.monthKey,
                            type: typeFilter === 'both' ? undefined : typeFilter,
                        }),
                    });
                },
            });
        }

        return list.slice(0, 5);
    }, [
        comparisonLabel,
        expenseRows,
        moneyFormatter,
        openOperations,
        percentFormatter,
        periodLabel,
        receivables.pendingTotal,
        selectedMonth?.monthKey,
        averageTicket,
        comparedAverageTicket,
        focusCategoryFromInsight,
        openInsightDetail,
        summaryVariation.avgTicket,
        summaryVariation.expenses,
        summaryVariation.incomes,
        t,
        trendRows,
        typeFilter,
    ]);

    const getTrendIcon = useCallback((trend: TrendType) => {
        if (trend === 'growing') return ArrowUpRight;
        if (trend === 'decreasing') return ArrowDownRight;
        return Minus;
    }, []);

    const getTrendLabel = useCallback((trend: TrendType) => {
        if (trend === 'growing') return t('trend-growing');
        if (trend === 'decreasing') return t('trend-decreasing');
        return t('trend-stable');
    }, [t]);

    const reportSummary = useMemo(() => {
        const topIncome = incomeRows[0]?.category || '-';
        const topExpense = expenseRows[0]?.category || '-';
        const topInsights = insights.slice(0, 3).map((insight) => `- ${insight.text}`).join('\n');

        return [
            t('analytics-report-title'),
            `${t('period')}: ${periodLabel}`,
            `${t('comparison')}: ${comparisonLabel}`,
            `${t('total-incomes')}: ${moneyFormatter.format(currentSummary.incomes)}`,
            `${t('total-expenses')}: ${moneyFormatter.format(currentSummary.expenses)}`,
            `${t('balance')}: ${moneyFormatter.format(currentSummary.balance)}`,
            `${t('top-income-category')}: ${topIncome}`,
            `${t('top-expense-category')}: ${topExpense}`,
            `${t('pending-amount')}: ${moneyFormatter.format(receivables.pendingTotal)}`,
            `${t('total-overdue')}: ${moneyFormatter.format(receivables.overdueTotal)}`,
            `${t('insights-title')}:`,
            topInsights || `- ${t('no-insights-available')}`,
        ].join('\n');
    }, [
        comparisonLabel,
        currentSummary.balance,
        currentSummary.expenses,
        currentSummary.incomes,
        expenseRows,
        incomeRows,
        insights,
        moneyFormatter,
        periodLabel,
        receivables.overdueTotal,
        receivables.pendingTotal,
        t,
    ]);

    const onCopySummary = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(reportSummary);
            toast.success(t('report-copied'));
        } catch {
            toast.error(t('report-copy-failed'));
        }
    }, [reportSummary, t]);

    const onCopyReportLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/billing-management?view=analytics`);
            toast.success(t('report-link-copied'));
        } catch {
            toast.error(t('report-copy-failed'));
        }
    }, [t]);

    const onShareNative = useCallback(async () => {
        if (!navigator.share) {
            toast.error(t('share-not-supported'));
            return;
        }

        try {
            await navigator.share({
                title: t('analytics-report-title'),
                text: reportSummary,
            });
        } catch {
            // User cancelled share action.
        }
    }, [reportSummary, t]);

    const onPrintPdf = useCallback(() => {
        window.print();
    }, []);

    const expenseObjectiveCurrent = expenseRows[0]?.amount || 0;
    const expenseObjectiveTarget = expenseObjectiveCurrent * 0.82;
    const incomeObjectiveCurrent = currentSummary.incomes;
    const incomeObjectiveTarget = incomeObjectiveCurrent * 1.2;

    const expenseProgress = expenseObjectiveCurrent > 0
        ? clampPercentage((expenseObjectiveTarget / expenseObjectiveCurrent) * 100)
        : 0;
    const incomeProgress = incomeObjectiveTarget > 0
        ? clampPercentage((incomeObjectiveCurrent / incomeObjectiveTarget) * 100)
        : 0;

    const onOpenSubscriptionsPlan = useCallback(() => {
        const subscriptionCategory = expenseRows.find((row) => {
            const normalizedCategory = row.category.toLowerCase();
            return normalizedCategory.includes('software')
                || normalizedCategory.includes('suscrip')
                || normalizedCategory.includes('subscription')
                || normalizedCategory.includes('saas')
                || normalizedCategory.includes('abbon');
        })?.category || expenseRows[0]?.category || '';

        const subscriptionRow = expenseRows.find((row) => row.category === subscriptionCategory);
        const categoryVariation = subscriptionRow?.variation || 0;

        openActionPlan({
            title: t('action-review-subscriptions'),
            reason: subscriptionCategory
                ? t('action-plan-reason-subscriptions-category', { category: subscriptionCategory })
                : t('action-plan-reason-subscriptions'),
            highlights: [
                `${t('period')}: ${periodLabel}`,
                `${t('current-value')}: ${moneyFormatter.format(subscriptionRow?.amount || expenseObjectiveCurrent)}`,
                `${t('variation-vs-comparison')}: ${categoryVariation >= 0 ? '+' : '-'}${percentFormatter.format(Math.abs(categoryVariation))}%`,
            ],
            steps: [
                t('action-plan-step-subscriptions-1'),
                t('action-plan-step-subscriptions-2'),
            ],
            primaryLabel: t('view-related-operations'),
            onPrimary: () => openOperations({
                type: 'expense',
                category: subscriptionCategory || undefined,
                month: selectedMonth?.monthKey,
            }),
        });
    }, [
        expenseObjectiveCurrent,
        expenseRows,
        moneyFormatter,
        openActionPlan,
        openOperations,
        percentFormatter,
        periodLabel,
        selectedMonth?.monthKey,
        t,
    ]);

    const onOpenOverduePlan = useCallback(() => {
        openActionPlan({
            title: t('action-contact-overdue'),
            reason: t('action-plan-reason-overdue'),
            highlights: [
                `${t('pending-amount')}: ${moneyFormatter.format(receivables.pendingTotal)}`,
                `${t('total-overdue')}: ${moneyFormatter.format(receivables.overdueTotal)}`,
                `${t('total-due-soon')}: ${moneyFormatter.format(receivables.dueSoonTotal)}`,
            ],
            steps: [
                t('action-plan-step-overdue-1'),
                t('action-plan-step-overdue-2'),
            ],
            primaryLabel: t('view-overdue-invoices'),
            onPrimary: () => openOperations({ type: 'income', focus: 'overdue' }),
        });
    }, [moneyFormatter, openActionPlan, openOperations, receivables.dueSoonTotal, receivables.overdueTotal, receivables.pendingTotal, t]);

    const onOpenMarketingPlan = useCallback(() => {
        const marketingCategory = expenseRows.find((row) => {
            const normalizedCategory = row.category.toLowerCase();
            return normalizedCategory.includes('marketing')
                || normalizedCategory.includes('ads')
                || normalizedCategory.includes('advert')
                || normalizedCategory.includes('public');
        })?.category || '';

        const marketingRow = expenseRows.find((row) => row.category === marketingCategory);
        const marketingVariation = marketingRow?.variation || summaryVariation.expenses;

        openActionPlan({
            title: t('action-review-marketing'),
            reason: marketingCategory
                ? t('action-plan-reason-marketing-category', { category: marketingCategory })
                : t('action-plan-reason-marketing'),
            highlights: [
                `${t('period')}: ${periodLabel}`,
                `${t('current-value')}: ${moneyFormatter.format(marketingRow?.amount || 0)}`,
                `${t('variation-vs-comparison')}: ${marketingVariation >= 0 ? '+' : '-'}${percentFormatter.format(Math.abs(marketingVariation))}%`,
            ],
            steps: [
                t('action-plan-step-marketing-1'),
                t('action-plan-step-marketing-2'),
            ],
            primaryLabel: t('view-related-operations'),
            onPrimary: () => openOperations({
                type: 'expense',
                category: marketingCategory || undefined,
                month: selectedMonth?.monthKey,
            }),
        });
    }, [
        expenseRows,
        moneyFormatter,
        openActionPlan,
        openOperations,
        percentFormatter,
        periodLabel,
        selectedMonth?.monthKey,
        summaryVariation.expenses,
        t,
    ]);

    const onOpenOtherCategoryPlan = useCallback(() => {
        const otherCategory = mergedRows.find((row) => {
            const normalizedCategory = row.category.toLowerCase();
            return normalizedCategory.includes('other')
                || normalizedCategory.includes('otros')
                || normalizedCategory.includes('altri')
                || normalizedCategory.includes('misc');
        })?.category || mergedRows[0]?.category || '';

        const otherCategoryRow = mergedRows.find((row) => row.category === otherCategory);

        openActionPlan({
            title: t('action-analyze-other'),
            reason: otherCategory
                ? t('action-plan-reason-other-category', { category: otherCategory })
                : t('action-plan-reason-other'),
            highlights: [
                `${t('period')}: ${periodLabel}`,
                `${t('current-value')}: ${moneyFormatter.format(otherCategoryRow?.amount || 0)}`,
                `${t('variation-vs-comparison')}: ${(otherCategoryRow?.variation || 0) >= 0 ? '+' : '-'}${percentFormatter.format(Math.abs(otherCategoryRow?.variation || 0))}%`,
            ],
            steps: [
                t('action-plan-step-other-1'),
                t('action-plan-step-other-2'),
            ],
            primaryLabel: t('view-related-operations'),
            onPrimary: () => openOperations({
                category: otherCategory || undefined,
                type: typeFilter === 'both' ? undefined : typeFilter,
                month: selectedMonth?.monthKey,
            }),
        });
    }, [
        mergedRows,
        moneyFormatter,
        openActionPlan,
        openOperations,
        percentFormatter,
        periodLabel,
        selectedMonth?.monthKey,
        t,
        typeFilter,
    ]);

    if (!activeOperations.length) {
        return (
            <div className="w-full max-w-[900px]">
                <NoData title="no-billing-data" description="add-operation" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pl-2">
            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="size-4 text-amber-500" />
                        {t('insights-title')}
                    </CardTitle>
                    <CardDescription>{t('insights-description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {insights.length === 0 && (
                        <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                            {t('no-insights-available')}
                        </div>
                    )}

                    {insights.map((insight) => (
                        <div
                            key={insight.id}
                            className={cn(
                                'rounded-xl border p-3',
                                insight.tone === 'positive' && 'border-emerald-200 bg-emerald-50/50',
                                insight.tone === 'warning' && 'border-amber-200 bg-amber-50/50',
                                insight.tone === 'neutral' && 'border-sky-200 bg-sky-50/50',
                            )}
                        >
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <p className="text-sm text-foreground">{insight.text}</p>
                                {insight.onAction && insight.actionLabel && (
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={insight.onAction}>
                                        {insight.actionLabel}
                                        <ArrowRight className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('incomes-by-category')}</CardTitle>
                        <CardDescription>{t('top-categories-amount')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {quickIncomeDonut.length === 0 && (
                            <p className="text-sm text-muted-foreground">{t('no-category-data')}</p>
                        )}

                        {quickIncomeDonut.length > 0 && (
                            <>
                                <ChartContainer
                                    config={{ amount: { label: t('amount'), color: 'hsl(var(--chart-2))' } }}
                                    className="h-[240px] w-full"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value, _name, _item, _index, payload) => {
                                                        const dataPoint = Array.isArray(payload)
                                                            ? ((payload[0]?.payload ?? {}) as Partial<DonutSlice>)
                                                            : {};

                                                        return (
                                                            <div className="flex w-full items-center justify-between gap-3">
                                                                <span>{dataPoint.category ?? ''}</span>
                                                                <span>{moneyFormatter.format(Number(value) || 0)}</span>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                        <Pie
                                            data={quickIncomeDonut}
                                            dataKey="amount"
                                            nameKey="category"
                                            innerRadius={58}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            strokeWidth={2}
                                        >
                                            {quickIncomeDonut.map((slice) => (
                                                <Cell key={`income-donut-${slice.category}`} fill={slice.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>

                                <div className="space-y-1">
                                    {quickIncomeDonut.map((slice) => (
                                        <div key={`income-legend-${slice.category}`} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full" style={{ backgroundColor: slice.fill }} />
                                                <span>{slice.category}</span>
                                            </div>
                                            <span className="text-muted-foreground">{percentFormatter.format(slice.share)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('expenses-by-category')}</CardTitle>
                        <CardDescription>{t('top-categories-amount')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {quickExpenseDonut.length === 0 && (
                            <p className="text-sm text-muted-foreground">{t('no-category-data')}</p>
                        )}

                        {quickExpenseDonut.length > 0 && (
                            <>
                                <ChartContainer
                                    config={{ amount: { label: t('amount'), color: 'hsl(var(--destructive))' } }}
                                    className="h-[240px] w-full"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value, _name, _item, _index, payload) => {
                                                        const dataPoint = Array.isArray(payload)
                                                            ? ((payload[0]?.payload ?? {}) as Partial<DonutSlice>)
                                                            : {};

                                                        return (
                                                            <div className="flex w-full items-center justify-between gap-3">
                                                                <span>{dataPoint.category ?? ''}</span>
                                                                <span>{moneyFormatter.format(Number(value) || 0)}</span>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                        <Pie
                                            data={quickExpenseDonut}
                                            dataKey="amount"
                                            nameKey="category"
                                            innerRadius={58}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            strokeWidth={2}
                                        >
                                            {quickExpenseDonut.map((slice) => (
                                                <Cell key={`expense-donut-${slice.category}`} fill={slice.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>

                                <div className="space-y-1">
                                    {quickExpenseDonut.map((slice) => (
                                        <div key={`expense-legend-${slice.category}`} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full" style={{ backgroundColor: slice.fill }} />
                                                <span>{slice.category}</span>
                                            </div>
                                            <span className="text-muted-foreground">{percentFormatter.format(slice.share)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="sticky top-[13rem] z-20 border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-[10.5rem]">
                <CardHeader className="space-y-3 pb-3">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
                        <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
                            <SelectTrigger className="gap-2">
                                <div className="flex items-center gap-2">
                                    {renderPeriodFilterIcon()}
                                    <span className="truncate">
                                        {periodFilter === '6m' && t('period-last-6-months')}
                                        {periodFilter === '12m' && t('period-last-12-months')}
                                        {periodFilter === 'ytd' && t('period-ytd')}
                                        {periodFilter === 'custom' && t('period-custom')}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6m">
                                    <span className="flex items-center gap-2">
                                        {/* <CalendarRange className="h-4 w-4 text-violet-500" /> */}
                                        <span>{t('period-last-6-months')}</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="12m">
                                    <span className="flex items-center gap-2">
                                        {/* <CalendarRange className="h-4 w-4 text-violet-500" /> */}
                                        <span>{t('period-last-12-months')}</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="ytd">
                                    <span className="flex items-center gap-2">
                                        {/* <CalendarRange className="h-4 w-4 text-violet-500" /> */}
                                        <span>{t('period-ytd')}</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="custom">
                                    <span className="flex items-center gap-2">
                                        {/* <CalendarRange className="h-4 w-4 text-violet-500" />s */}
                                        <span>{t('period-custom')}</span>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={(value: TypeFilter) => setTypeFilter(value)}>
                            <SelectTrigger className="gap-2">
                                <div className="flex items-center gap-2">
                                    {renderTypeFilterIcon(typeFilter)}
                                    <span className="truncate">
                                        {typeFilter === 'both' && t('both')}
                                        {typeFilter === 'income' && t('income')}
                                        {typeFilter === 'expense' && t('expense')}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="both">
                                    <span className="flex items-center gap-2">
                                        <Layers2 className="h-4 w-4 text-sky-500" />
                                        <span>{t('both')}</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="expense">
                                    <span className="flex items-center gap-2">
                                        <LayerArrowUp className="h-4 w-4 text-rose-500" />
                                        <span>{t('expense')}</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="income">
                                    <span className="flex items-center gap-2">
                                        <LayerArrowDown className="h-4 w-4 text-emerald-500" />
                                        <span>{t('income')}</span>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="gap-2">
                                <div className="flex items-center gap-2">
                                    <CirclePile className="h-4 w-4 text-purple-400" />
                                    <span className="truncate">
                                        {categoryFilter === 'ALL' ? t('all-categories') : categoryFilter}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    <span className="flex items-center gap-2">
                                        <CirclePile className="h-4 w-4 text-purple-400" />
                                        <span>{t('all-categories')}</span>
                                    </span>
                                </SelectItem>
                                {availableCategories.map((category) => {
                                    const isIncomeCategory = incomeCategories.includes(category);
                                    const isExpenseCategory = expenseCategories.includes(category);
                                    const categoryColor = isIncomeCategory
                                        ? 'text-emerald-500'
                                        : isExpenseCategory
                                            ? 'text-rose-500'
                                            : 'text-muted-foreground';

                                    return (
                                        <SelectItem key={category} value={category}>
                                            <span className="flex items-center gap-2">
                                                <CircleSmall className={cn('h-4 w-4', categoryColor)} />
                                                <span>{category}</span>
                                            </span>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        <Select value={comparisonMode} onValueChange={(value: CompareMode) => setComparisonMode(value)}>
                            <SelectTrigger className="gap-2">
                                <div className="flex items-center gap-2">
                                    {renderComparisonModeIcon(comparisonMode)}
                                    <span className="truncate">
                                        {comparisonMode === 'previous' && t('comparison-previous-period')}
                                        {comparisonMode === 'yoy' && t('comparison-same-period-last-year')}
                                        {comparisonMode === 'budget' && t('comparison-budget')}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="previous">
                                    <span className="flex items-center gap-2">
                                        <CalendarRange className="h-4 w-4 text-violet-500" />
                                        <span>{t('comparison-previous-period')}</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="yoy">
                                    <span className="flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
                                        <span>{t('comparison-same-period-last-year')}</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="budget">
                                    <span className="flex items-center gap-2">
                                        <CircleDollarSign className="h-4 w-4 text-amber-500" />
                                        <span>{t('comparison-budget')}</span>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {periodFilter === 'custom' && (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <CustomDatePicker
                                value={customFrom}
                                onChange={setCustomFrom}
                                hideIcon
                                label={t('from-date')}
                                onClear={() => setCustomFrom(undefined)}
                                clearButtonTitle={t('clear-filter-date')}
                            />
                            <CustomDatePicker
                                value={customTo}
                                onChange={setCustomTo}
                                hideIcon
                                label={t('to-date')}
                                onClear={() => setCustomTo(undefined)}
                                clearButtonTitle={t('clear-filter-date')}
                            />
                        </div>
                    )}

                    {isBudgetFallback && (
                        <Badge variant="outline" className="w-fit border-amber-300 text-amber-700">
                            {t('budget-fallback-note')}
                        </Badge>
                    )}
                </CardHeader>
            </Card>

            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-base">{t('financial-evolution-title')}</CardTitle>
                            <CardDescription>{t('financial-evolution-description')}</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant={visibleSeries.incomes ? 'default' : 'outline'}
                                className="h-8"
                                onClick={() => setVisibleSeries((prev) => ({ ...prev, incomes: !prev.incomes }))}
                            >
                                {t('incomes')}
                            </Button>
                            <Button
                                size="sm"
                                variant={visibleSeries.expenses ? 'default' : 'outline'}
                                className="h-8"
                                onClick={() => setVisibleSeries((prev) => ({ ...prev, expenses: !prev.expenses }))}
                            >
                                {t('expenses')}
                            </Button>
                            <Button
                                size="sm"
                                variant={visibleSeries.balance ? 'default' : 'outline'}
                                className="h-8"
                                onClick={() => setVisibleSeries((prev) => ({ ...prev, balance: !prev.balance }))}
                            >
                                {t('balance')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ChartContainer
                        config={{
                            incomes: { label: t('incomes'), color: 'hsl(var(--chart-2))' },
                            expenses: { label: t('expenses'), color: 'hsl(var(--destructive))' },
                            balance: { label: t('balance'), color: 'hsl(var(--chart-1))' },
                        }}
                        className="h-[300px] w-full"
                    >
                        <LineChart
                            data={monthlySeries}
                            margin={{ top: 10, right: 16, left: 8, bottom: 0 }}
                            onClick={(state: unknown) => {
                                const chartState = state as { activePayload?: Array<{ payload?: MonthlyPoint }> };
                                const payload = chartState.activePayload?.[0]?.payload;
                                if (!payload) return;
                                setSelectedMonthKey(payload.monthKey);
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={54} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        indicator="line"
                                        formatter={(value, name) => (
                                            <div className="flex w-full items-center justify-between gap-3">
                                                <span>{name}</span>
                                                <span>{moneyFormatter.format(Number(value) || 0)}</span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Legend />
                            {visibleSeries.incomes && (
                                <Line type="monotone" dataKey="incomes" stroke="var(--color-incomes)" strokeWidth={2.3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                            )}
                            {visibleSeries.expenses && (
                                <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2.3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                            )}
                            {visibleSeries.balance && (
                                <Line type="monotone" dataKey="balance" stroke="var(--color-balance)" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                            )}
                        </LineChart>
                    </ChartContainer>

                    {selectedMonth && (
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium">{t('month-breakdown')} - {selectedMonth.monthLabel}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 px-2"
                                    onClick={() => openOperations({ month: selectedMonth.monthKey, type: typeFilter === 'both' ? undefined : typeFilter })}
                                >
                                    {t('view-operations')}
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('incomes')}</p>
                                    <p className="text-lg font-semibold">{moneyFormatter.format(selectedMonth.incomes)}</p>
                                </div>
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('expenses')}</p>
                                    <p className="text-lg font-semibold">{moneyFormatter.format(selectedMonth.expenses)}</p>
                                </div>
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('balance')}</p>
                                    <p className={cn('text-lg font-semibold', selectedMonth.balance >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                        {moneyFormatter.format(selectedMonth.balance)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">{t('expense-drivers')}</p>
                                {selectedMonthExpenseDrivers.length === 0 && (
                                    <p className="text-sm text-muted-foreground">{t('no-expense-drivers')}</p>
                                )}
                                {selectedMonthExpenseDrivers.map((driver) => (
                                    <div key={driver.category} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
                                        <span>{driver.category}</span>
                                        <span className="font-medium">
                                            {moneyFormatter.format(driver.amount)}
                                            <span className={cn('ml-2 text-xs', driver.difference >= 0 ? 'text-rose-600' : 'text-emerald-600')}>
                                                ({driver.variation >= 0 ? '+' : '-'}{percentFormatter.format(Math.abs(driver.variation))}%)
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <Card className="xl:col-span-3 border-border/80 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('financial-structure-title')}</CardTitle>
                        <CardDescription>{t('financial-structure-description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="mb-2 text-sm font-medium">{t('incomes-by-category')}</p>
                            {incomeRows.length === 0 && <p className="text-sm text-muted-foreground">{t('no-category-data')}</p>}
                            <div className="space-y-1">
                                {incomeRows.slice(0, 6).map((row) => (
                                    <button
                                        key={`income-${row.category}`}
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-left text-sm transition hover:bg-muted/40"
                                        onClick={() => {
                                            setSelectedCategory(row.category);
                                            setSelectedCategoryType('income');
                                        }}
                                    >
                                        <div>
                                            <p className="font-medium">{row.category}</p>
                                            <p className="text-xs text-muted-foreground">{percentFormatter.format(row.share)}% {t('share-of-total')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p>{moneyFormatter.format(row.amount)}</p>
                                            <p className={cn('text-xs', row.variation >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                                {row.variation >= 0 ? '+' : '-'}{percentFormatter.format(Math.abs(row.variation))}%
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <p className="mb-2 text-sm font-medium">{t('expenses-by-category')}</p>
                            {expenseRows.length === 0 && <p className="text-sm text-muted-foreground">{t('no-category-data')}</p>}
                            <div className="space-y-1">
                                {expenseRows.slice(0, 6).map((row) => (
                                    <button
                                        key={`expense-${row.category}`}
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-left text-sm transition hover:bg-muted/40"
                                        onClick={() => {
                                            setSelectedCategory(row.category);
                                            setSelectedCategoryType('expense');
                                        }}
                                    >
                                        <div>
                                            <p className="font-medium">{row.category}</p>
                                            <p className="text-xs text-muted-foreground">{percentFormatter.format(row.share)}% {t('share-of-total')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p>{moneyFormatter.format(row.amount)}</p>
                                            <p className={cn('text-xs', row.variation >= 0 ? 'text-rose-600' : 'text-emerald-600')}>
                                                {row.variation >= 0 ? '+' : '-'}{percentFormatter.format(Math.abs(row.variation))}%
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card id="analytics-category-detail" className="xl:col-span-2 border-border/80 shadow-sm scroll-mt-28">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('category-detail-title')}</CardTitle>
                        <CardDescription>{selectedCategory || t('all-categories')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {!selectedCategoryRow && (
                            <p className="text-sm text-muted-foreground">{t('no-category-selected')}</p>
                        )}

                        {selectedCategoryRow && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg border bg-muted/20 p-2 text-sm">
                                        <p className="text-xs text-muted-foreground">{t('amount')}</p>
                                        <p className="font-semibold">{moneyFormatter.format(selectedCategoryRow.amount)}</p>
                                    </div>
                                    <div className="rounded-lg border bg-muted/20 p-2 text-sm">
                                        <p className="text-xs text-muted-foreground">{t('variation-vs-comparison')}</p>
                                        <p className={cn('font-semibold', selectedCategoryRow.variation >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                            {selectedCategoryRow.variation >= 0 ? '+' : '-'}{percentFormatter.format(Math.abs(selectedCategoryRow.variation))}%
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs text-muted-foreground">{t('monthly-evolution')}</p>
                                    <ChartContainer
                                        config={{
                                            amount: { label: t('amount'), color: 'hsl(var(--chart-1))' },
                                        }}
                                        className="h-[180px] w-full"
                                    >
                                        <LineChart data={selectedCategorySeries} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis tickLine={false} axisLine={false} width={46} />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        indicator="line"
                                                        formatter={(value) => <span>{moneyFormatter.format(Number(value) || 0)}</span>}
                                                    />
                                                }
                                            />
                                            <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2.3} dot={{ r: 2 }} />
                                        </LineChart>
                                    </ChartContainer>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() => openOperations({
                                        category: selectedCategoryRow.category,
                                        type: selectedCategoryType === 'both' ? undefined : selectedCategoryType,
                                        month: selectedMonth?.monthKey,
                                    })}
                                >
                                    {t('view-related-operations')}
                                    <ArrowRight className="size-4" />
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('trends-title')}</CardTitle>
                    <CardDescription>{t('trends-description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {trendRows.length === 0 && <p className="text-sm text-muted-foreground">{t('no-trends-data')}</p>}

                    {trendRows.map((row) => {
                        const Icon = getTrendIcon(row.trend);

                        return (
                            <div key={row.category} className="rounded-xl border bg-background p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium">{row.category}</p>
                                        <p className="text-xs text-muted-foreground">{row.context}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="inline-flex items-center gap-1 text-sm font-medium">
                                            <Icon className="size-4" />
                                            {getTrendLabel(row.trend)}
                                        </p>
                                        <p className={cn('text-xs', row.variation >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                            {row.variation >= 0 ? '+' : '-'}{percentFormatter.format(Math.abs(row.variation))}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ReceiptText className="size-4 text-amber-500" />
                        {t('receivables-title')}
                    </CardTitle>
                    <CardDescription>{t('receivables-description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">{t('pending-amount')}</p>
                            <p className="text-xl font-semibold">{moneyFormatter.format(receivables.pendingTotal)}</p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">{t('total-overdue')}</p>
                            <p className="text-xl font-semibold text-rose-600">{moneyFormatter.format(receivables.overdueTotal)}</p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">{t('total-due-soon')}</p>
                            <p className="text-xl font-semibold text-amber-600">{moneyFormatter.format(receivables.dueSoonTotal)}</p>
                        </div>
                    </div>

                    <div className="space-y-2 rounded-xl border bg-background p-3">
                        <p className="text-sm font-medium">{t('aging-buckets')}</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span>{t('aging-0-30')}</span>
                                <span>{moneyFormatter.format(receivables.aging.bucket0to30)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{t('aging-31-60')}</span>
                                <span>{moneyFormatter.format(receivables.aging.bucket31to60)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{t('aging-61-90')}</span>
                                <span>{moneyFormatter.format(receivables.aging.bucket61to90)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{t('aging-90-plus')}</span>
                                <span className="font-semibold text-rose-600">{moneyFormatter.format(receivables.aging.bucket90plus)}</span>
                            </div>
                        </div>

                        {receivables.aging.bucket90plus > 0 && (
                            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                {t('aging-90-warning', { value: moneyFormatter.format(receivables.aging.bucket90plus) })}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => openOperations({ type: 'income', status: 'PENDING' })}
                        >
                            <FileText className="size-4" />
                            {t('view-invoices')}
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => openOperations({ type: 'income', focus: 'overdue' })}
                        >
                            <CalendarClock className="size-4" />
                            {t('view-overdue-invoices')}
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                                if (!selectedCategory) return;
                                openOperations({ type: 'income', category: selectedCategory });
                            }}
                            disabled={!selectedCategory}
                        >
                            <CircleDollarSign className="size-4" />
                            {t('filter-related-operations')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Rocket className="size-4 text-sky-600" />
                        {t('projection-title')}
                    </CardTitle>
                    <CardDescription>{t('projection-description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ChartContainer
                        config={{
                            historicalBalance: { label: t('historical-balance'), color: 'hsl(var(--chart-1))' },
                            projectedBalance: { label: t('projected-balance'), color: 'hsl(var(--chart-1))' },
                            historicalIncomes: { label: t('historical-incomes'), color: 'hsl(var(--chart-2))' },
                            projectedIncomes: { label: t('projected-incomes'), color: 'hsl(var(--chart-2))' },
                            historicalExpenses: { label: t('historical-expenses'), color: 'hsl(var(--destructive))' },
                            projectedExpenses: { label: t('projected-expenses'), color: 'hsl(var(--destructive))' },
                        }}
                        className="h-[300px] w-full"
                    >
                        <LineChart data={projection.chartData} margin={{ top: 10, right: 14, left: 8, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={52} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        indicator="line"
                                        formatter={(value, name) => {
                                            if (value == null) return null;
                                            return (
                                                <div className="flex w-full items-center justify-between gap-3">
                                                    <span>{name}</span>
                                                    <span>{moneyFormatter.format(Number(value) || 0)}</span>
                                                </div>
                                            );
                                        }}
                                    />
                                }
                            />
                            <Line dataKey="historicalBalance" type="monotone" stroke="var(--color-historicalBalance)" strokeWidth={2.3} dot={false} />
                            <Line dataKey="projectedBalance" type="monotone" stroke="var(--color-projectedBalance)" strokeDasharray="5 5" strokeWidth={2.3} dot={false} />
                            <Line dataKey="historicalIncomes" type="monotone" stroke="var(--color-historicalIncomes)" strokeWidth={1.8} dot={false} />
                            <Line dataKey="projectedIncomes" type="monotone" stroke="var(--color-projectedIncomes)" strokeDasharray="4 4" strokeWidth={1.8} dot={false} />
                            <Line dataKey="historicalExpenses" type="monotone" stroke="var(--color-historicalExpenses)" strokeWidth={1.8} dot={false} />
                            <Line dataKey="projectedExpenses" type="monotone" stroke="var(--color-projectedExpenses)" strokeDasharray="4 4" strokeWidth={1.8} dot={false} />
                        </LineChart>
                    </ChartContainer>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {projection.projected.map((entry) => (
                            <div key={entry.monthKey} className="rounded-xl border bg-muted/20 p-3">
                                <p className="text-sm text-muted-foreground">{entry.monthLabel}</p>
                                <p className={cn('text-xl font-semibold', entry.balance >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                    {moneyFormatter.format(entry.balance)}
                                </p>
                                <p className="text-xs text-muted-foreground">{t('incomes')}: {moneyFormatter.format(entry.incomes)}</p>
                                <p className="text-xs text-muted-foreground">{t('expenses')}: {moneyFormatter.format(entry.expenses)}</p>
                            </div>
                        ))}
                    </div>

                    {projection.balanceDrop < -15 && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            {t('projection-risk-alert', {
                                month: projection.finalProjectedMonth,
                                value: percentFormatter.format(Math.abs(projection.balanceDrop)),
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="size-4 text-violet-600" />
                        {t('goals-planning-title')}
                    </CardTitle>
                    <CardDescription>{t('goals-planning-description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="font-medium">{t('goal-reduce-expenses')}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{t('current-value')}: {moneyFormatter.format(expenseObjectiveCurrent)}</p>
                            <p className="text-sm text-muted-foreground">{t('target-value')}: {moneyFormatter.format(expenseObjectiveTarget)}</p>
                            <p className="text-sm text-muted-foreground">{t('target-date')}: {t('goal-target-date-expenses')}</p>
                            <Progress value={expenseProgress} className="mt-3" />
                            <p className="mt-1 text-xs text-muted-foreground">{t('progress')}: {percentFormatter.format(expenseProgress)}%</p>
                        </div>

                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="font-medium">{t('goal-increase-incomes')}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{t('current-value')}: {moneyFormatter.format(incomeObjectiveCurrent)}</p>
                            <p className="text-sm text-muted-foreground">{t('target-value')}: {moneyFormatter.format(incomeObjectiveTarget)}</p>
                            <p className="text-sm text-muted-foreground">{t('target-date')}: {t('goal-target-date-incomes')}</p>
                            <Progress value={incomeProgress} className="mt-3" />
                            <p className="mt-1 text-xs text-muted-foreground">{t('progress')}: {percentFormatter.format(incomeProgress)}%</p>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-3">
                        <p className="text-sm font-medium">{t('next-actions')}</p>
                        <p className="mb-3 text-xs text-muted-foreground">{t('next-actions-description')}</p>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <Button
                                variant="outline"
                                className="h-auto justify-between gap-3 py-3"
                                onClick={onOpenSubscriptionsPlan}
                            >
                                <div className="flex items-start gap-2 text-left">
                                    <FileText className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <p className="font-medium">{t('action-review-subscriptions')}</p>
                                        <p className="text-xs text-muted-foreground">{t('action-review-subscriptions-description')}</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 shrink-0" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto justify-between gap-3 py-3"
                                onClick={onOpenOverduePlan}
                            >
                                <div className="flex items-start gap-2 text-left">
                                    <CalendarClock className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <p className="font-medium">{t('action-contact-overdue')}</p>
                                        <p className="text-xs text-muted-foreground">{t('action-contact-overdue-description')}</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 shrink-0" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto justify-between gap-3 py-3"
                                onClick={onOpenMarketingPlan}
                            >
                                <div className="flex items-start gap-2 text-left">
                                    <TrendingDown className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <p className="font-medium">{t('action-review-marketing')}</p>
                                        <p className="text-xs text-muted-foreground">{t('action-review-marketing-description')}</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 shrink-0" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto justify-between gap-3 py-3"
                                onClick={onOpenOtherCategoryPlan}
                            >
                                <div className="flex items-start gap-2 text-left">
                                    <TrendingUp className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <p className="font-medium">{t('action-analyze-other')}</p>
                                        <p className="text-xs text-muted-foreground">{t('action-analyze-other-description')}</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 shrink-0" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-3">
                        <p className="text-sm font-medium">{t('share-report')}</p>
                        <p className="mb-3 text-xs text-muted-foreground">{t('share-report-description')}</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" className="gap-2" onClick={onCopySummary}>
                                <FileText className="size-4" />
                                {t('copy-summary')}
                            </Button>
                            <Button variant="outline" className="gap-2" onClick={onCopyReportLink}>
                                <Link2 className="size-4" />
                                {t('copy-report-link')}
                            </Button>
                            <Button variant="outline" className="gap-2" onClick={onPrintPdf}>
                                <Download className="size-4" />
                                {t('export-pdf')}
                            </Button>
                            <Button variant="outline" className="gap-2" onClick={onShareNative}>
                                <Share2 className="size-4" />
                                {t('share-native')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DialogContainer
                isOpen={isInsightDetailOpen}
                setIsOpen={setIsInsightDetailOpen}
                title={insightDetail?.title || t('insight-detail-title')}
                description={insightDetail?.description || t('insight-detail-description')}
                contentClassName="pb-4"
                bodyClassName="space-y-4 py-1"
            >
                <div className="space-y-2">
                    {(insightDetail?.highlights || []).map((highlight) => (
                        <div key={highlight} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                            {highlight}
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <Button variant="ghost" onClick={() => setIsInsightDetailOpen(false)}>
                        {t('close')}
                    </Button>
                    <Button
                        onClick={() => {
                            insightDetail?.onPrimary?.();
                            setIsInsightDetailOpen(false);
                        }}
                    >
                        {insightDetail?.primaryLabel || t('view-operations')}
                    </Button>
                </div>
            </DialogContainer>

            <DialogContainer
                isOpen={isActionPlanOpen}
                setIsOpen={setIsActionPlanOpen}
                title={actionPlan?.title || t('next-actions')}
                description={t('action-plan-description')}
                contentClassName="pb-4"
                bodyClassName="space-y-4 py-1"
            >
                <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('action-plan-why-title')}</p>
                    <p className="text-sm">{actionPlan?.reason}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('action-plan-highlights-title')}</p>
                    {(actionPlan?.highlights || []).map((highlight) => (
                        <div key={highlight} className="rounded-lg border bg-background px-3 py-2 text-sm">
                            {highlight}
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('action-plan-steps-title')}</p>
                    <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
                        {(actionPlan?.steps || []).map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ol>
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <Button variant="ghost" onClick={() => setIsActionPlanOpen(false)}>
                        {t('close')}
                    </Button>
                    <Button
                        onClick={() => {
                            actionPlan?.onPrimary?.();
                            setIsActionPlanOpen(false);
                        }}
                    >
                        {actionPlan?.primaryLabel || t('view-related-operations')}
                    </Button>
                </div>
            </DialogContainer>
        </div>
    );
}

export default BillingAnalyticsWorkspace;
