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
import { differenceInDays } from "date-fns";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Deal } from "../types";

interface DealHealthDialogProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SignalStatus = "ok" | "warn";

interface HealthSignal {
  label: string;
  status: SignalStatus;
}

const computeHealthBreakdown = (
  deal: Deal,
  t: (key: string) => string
): HealthSignal[] => {
  const signals: HealthSignal[] = [];
  const today = new Date();

  // 1. Expected close date
  if (deal.expectedCloseDate) {
    const daysUntil = differenceInDays(new Date(deal.expectedCloseDate), today);
    if (daysUntil < 0) {
      signals.push({ label: t("signals.close-date-overdue"), status: "warn" });
    } else if (daysUntil <= 7) {
      signals.push({ label: t("signals.close-date-soon"), status: "warn" });
    } else {
      signals.push({ label: t("signals.close-date-ok"), status: "ok" });
    }
  } else {
    signals.push({ label: t("signals.close-date-missing"), status: "warn" });
  }

  // 2. Activity recency
  const lastActivityMs =
    deal.activities.length > 0
      ? Math.max(...deal.activities.map((a) => new Date(a.timestamp).getTime()))
      : null;

  if (lastActivityMs === null) {
    signals.push({ label: t("signals.activity-none"), status: "warn" });
  } else {
    const daysSince = differenceInDays(today, new Date(lastActivityMs));
    if (daysSince > 14) {
      signals.push({ label: t("signals.activity-inactive"), status: "warn" });
    } else if (daysSince > 7) {
      signals.push({ label: t("signals.activity-stale"), status: "warn" });
    } else if (daysSince <= 3) {
      signals.push({ label: t("signals.activity-recent"), status: "ok" });
    } else {
      signals.push({ label: t("signals.activity-ok"), status: "ok" });
    }
  }

  // 3. Next step defined
  if (!deal.nextStep || deal.nextStep.trim() === "") {
    signals.push({ label: t("signals.next-step-missing"), status: "warn" });
  } else {
    signals.push({ label: t("signals.next-step-ok"), status: "ok" });
  }

  // 4. Priority
  if (deal.priority === 3) {
    signals.push({ label: t("signals.priority-high"), status: "ok" });
  } else if (deal.priority === 2) {
    signals.push({ label: t("signals.priority-medium"), status: "ok" });
  } else {
    signals.push({ label: t("signals.priority-low"), status: "warn" });
  }

  // 5. Stage stagnation
  if (deal.lastStageChangedAt) {
    const daysInStage = differenceInDays(today, new Date(deal.lastStageChangedAt));
    if (daysInStage > 30) {
      signals.push({ label: t("signals.stage-stagnant-30"), status: "warn" });
    } else if (daysInStage > 14) {
      signals.push({ label: t("signals.stage-stagnant-14"), status: "warn" });
    } else {
      signals.push({ label: t("signals.stage-recent"), status: "ok" });
    }
  }

  return signals;
};

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

  if (!deal) return null;

  const isResolved = deal.outcome !== "PENDING";
  const signals = isResolved ? [] : computeHealthBreakdown(deal, t);
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
                  <span>{signal.label}</span>
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
