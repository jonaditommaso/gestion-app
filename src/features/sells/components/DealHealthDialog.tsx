"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Deal } from "../types";
import { computeHealthSignals, type HealthSignal } from "../utils/health";

interface DealHealthDialogProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getScoreColorClassName = (score: number): string => {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
};

const getProgressIndicatorClassName = (score: number): string => {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-destructive";
};

const DealHealthDialog = ({ deal, open, onOpenChange }: DealHealthDialogProps) => {
  const t = useTranslations("sales.health-dialog");
  const tSignal = t as unknown as (key: string, values?: Record<string, string | number>) => string;

  if (!deal) return null;

  const isResolved = deal.outcome !== "PENDING";
  const signals: HealthSignal[] = isResolved ? [] : computeHealthSignals(deal);
  const okCount = signals.filter((s) => s.status === "ok").length;
  const warnCount = signals.filter((s) => s.status === "warn").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {isResolved ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("won-lost-note")}
          </p>
        ) : (
          <div className="space-y-5">
            {/* Score display */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">{t("score-label")}</span>
                <span className={cn("text-3xl font-bold tabular-nums", getScoreColorClassName(deal.healthScore))}>
                  {deal.healthScore}%
                </span>
              </div>
              <Progress
                value={deal.healthScore}
                className="h-2"
                indicatorClassName={getProgressIndicatorClassName(deal.healthScore)}
              />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="size-3" />
                  {okCount} {t("ok-count")}
                </span>
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="size-3" />
                  {warnCount} {t("warn-count")}
                </span>
              </div>
            </div>

            {/* Signal list */}
            <div className="space-y-2">
              {signals.map((signal, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 rounded-md border px-3 py-2.5 text-sm",
                    signal.status === "ok"
                      ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
                      : "border-destructive/20 bg-destructive/8 text-destructive"
                  )}
                >
                  {signal.status === "ok" ? (
                    <CheckCircle2 className="mt-px size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-px size-4 shrink-0" />
                  )}
                  <span>{tSignal(`signals.${signal.key}`, signal.params)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DealHealthDialog;
