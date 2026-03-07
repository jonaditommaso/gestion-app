'use client'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetPipelineHealth } from "@/features/sells/api/use-get-pipeline-health";
import { useGetSalesBoards } from "@/features/sells/api/use-get-sales-boards";
import { useTranslations } from "next-intl";
import { TrendingUp, Users, Briefcase, Trophy, Target } from "lucide-react";
import Link from "next/link";
import type { SalesBoard } from "@/features/sells/types";

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const PipelineHealthWidget = () => {
    const t = useTranslations('home');
    const { data: healthData, isLoading: isLoadingHealth } = useGetPipelineHealth();
    const { data: boardsData, isLoading: isLoadingBoards } = useGetSalesBoards();

    const boards: SalesBoard[] = (boardsData?.documents ?? []) as unknown as SalesBoard[];
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

    const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? boards[0] ?? null;

    console.log('Pipeline health data:', healthData);
    const primaryCurrencyStats = healthData?.totalByCurrency[0] ?? null;

    const isLoading = isLoadingHealth || isLoadingBoards;

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-5 w-1/2" />
                </CardContent>
            </Card>
        );
    }

    const boardOptions = boards.length > 1 ? boards : null;

    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">
                        {selectedBoard?.name ?? t('pipeline-health-title')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {boardOptions && (
                            <Select
                                value={selectedBoardId ?? selectedBoard?.id ?? ''}
                                onValueChange={setSelectedBoardId}
                            >
                                <SelectTrigger className="h-6 text-xs w-32 border-none shadow-none px-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {boards.map((board) => (
                                        <SelectItem key={board.id} value={board.id} className="text-xs">
                                            {board.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Link
                            href="/sells"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                        >
                            {t('pipeline-health-view-all')}
                        </Link>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                {primaryCurrencyStats && (
                    <>
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="text-xs">{t('pipeline-health-total-value')}</span>
                            </div>
                            <span className="text-xs font-semibold">
                                {formatCurrency(primaryCurrencyStats.totalValue, primaryCurrencyStats.currency)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="text-xs">{t('pipeline-health-weighted')}</span>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(primaryCurrencyStats.weightedValue, primaryCurrencyStats.currency)}
                            </span>
                        </div>
                    </>
                )}

                <div className="pt-1 border-t border-border/50 space-y-0.5">
                    <div className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs">{t('pipeline-health-leads')}</span>
                        </div>
                        <span className="text-xs font-semibold">{healthData?.leadsCount ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs">{t('pipeline-health-open-deals')}</span>
                        </div>
                        <span className="text-xs font-semibold">{healthData?.openDealsCount ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs">{t('pipeline-health-negotiation')}</span>
                        </div>
                        <span className="text-xs font-semibold">{healthData?.negotiationCount ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs font-medium">{t('pipeline-health-won-week')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {(healthData?.wonThisWeekByCurrency ?? []).length > 0 && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(
                                        healthData!.wonThisWeekByCurrency[0].totalValue,
                                        healthData!.wonThisWeekByCurrency[0].currency
                                    )}
                                </span>
                            )}
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                ({healthData?.wonThisWeek ?? 0})
                            </span>
                        </div>
                    </div>
                </div>

                {(!healthData || healthData.openDealsCount === 0) && (
                    <p className="text-xs text-muted-foreground py-1 text-center">
                        {t('pipeline-health-empty')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default PipelineHealthWidget;
