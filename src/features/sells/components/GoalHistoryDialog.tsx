"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useLocale, useTranslations } from "next-intl";
import type { SalesGoal } from "../types";

export type { SalesGoal as GoalHistoryEntry };

interface GoalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: SalesGoal[];
}

const GoalHistoryDialog = ({ open, onOpenChange, history }: GoalHistoryDialogProps) => {
  const t = useTranslations("sales");
  const locale = useLocale();

  const formatAmount = (value: number, currency: string): string =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPeriod = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long" });
    } catch {
      return iso;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("goal.history-title")}</DialogTitle>
          <DialogDescription>{t("goal.history-description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {history.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("goal.no-history")}</p>
          )}
          {history.map((entry) => {
            const dealsProgress =
              entry.totalDeals > 0
                ? Math.round((entry.totalDealsWon / entry.totalDeals) * 100)
                : 0;
            const cappedProgress = Math.min(100, dealsProgress);

            const badgeClassName = entry.targetReached
              ? "bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))]"
              : dealsProgress >= 80
                ? "bg-[hsl(var(--chart-4)/0.15)] text-[hsl(var(--chart-4))]"
                : "bg-destructive/10 text-destructive";

            const indicatorClassName = entry.targetReached
              ? "bg-[hsl(var(--chart-2))]"
              : dealsProgress >= 80
                ? "bg-[hsl(var(--chart-4))]"
                : "bg-destructive";

            return (
              <div key={entry.id} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatPeriod(entry.period)}</span>
                  <Badge className={badgeClassName}>
                    {entry.targetReached ? t("goal.reached") : `${cappedProgress}%`}
                  </Badge>
                </div>

                {entry.totalDeals > 0 && (
                  <Progress
                    value={cappedProgress}
                    className="h-1.5"
                    indicatorClassName={indicatorClassName}
                  />
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("goal.target")}: {formatAmount(entry.targetAmount, entry.currency)}</span>
                  <span>
                    {t("goal.deals-won-of", { won: entry.totalDealsWon, total: entry.totalDeals })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalHistoryDialog;
