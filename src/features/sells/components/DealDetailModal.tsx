"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CustomDatePicker from "@/components/CustomDatePicker";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileEdit,
  Pencil,
  Plus,
  Send,
  Trophy,
  Undo2,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import type { ActivityEntry, Deal, DealOutcome, DealStage, Seller } from "../types";

const STAGE_ORDER: DealStage[] = ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"];

interface DealDetailModalProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateDeal: (id: string, updater: (deal: Deal) => Deal) => void;
  sellers: Seller[];
  onMoveToStage: (id: string, stage: DealStage) => void;
  onSaveNextStep: (dealId: string, nextStep: string) => void;
  onAddActivity: (dealId: string, content: string, type?: "step-completed") => void;
  onMarkOutcome: (id: string, outcome: DealOutcome) => void;
}

const getPriorityClassName = (priority: Deal["priority"]): string => {
  if (priority === 3) return "border-destructive/30 bg-destructive/10 text-destructive";
  if (priority === 2)
    return "border-[hsl(var(--chart-4)/0.35)] bg-[hsl(var(--chart-4)/0.12)] text-[hsl(var(--chart-4))]";
  return "border-[hsl(var(--chart-1)/0.35)] bg-[hsl(var(--chart-1)/0.12)] text-[hsl(var(--chart-1))]";
};

const getHealthTextClassName = (score: number): string => {
  if (score < 50) return "text-destructive";
  if (score < 75) return "text-[hsl(var(--chart-4))]";
  return "text-[hsl(var(--chart-2))]";
};

const getHealthIndicatorClassName = (score: number): string => {
  if (score < 50) return "bg-destructive";
  if (score < 75) return "bg-[hsl(var(--chart-4))]";
  return "bg-[hsl(var(--chart-2))]";
};

const formatTimestamp = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DealDetailModal = ({
  deal,
  open,
  onOpenChange,
  onUpdateDeal,
  sellers,
  onMoveToStage,
  onSaveNextStep,
  onAddActivity,
  onMarkOutcome,
}: DealDetailModalProps) => {
  const t = useTranslations("sales");

  const [closeDate, setCloseDate] = useState<Date | undefined>(undefined);

  const [nextStepText, setNextStepText] = useState<string>("");
  const [isEditingNextStep, setIsEditingNextStep] = useState<boolean>(false);
  const [nextStepDraft, setNextStepDraft] = useState<string>("");
  const [isAddingNextStep, setIsAddingNextStep] = useState<boolean>(false);
  const [newNextStepDraft, setNewNextStepDraft] = useState<string>("");

  const [activityText, setActivityText] = useState<string>("");

  useEffect(() => {
    if (deal) {
      if (deal.expectedCloseDate && deal.expectedCloseDate.length >= 10) {
        const parsed = new Date(deal.expectedCloseDate + "T12:00:00");
        setCloseDate(Number.isNaN(parsed.getTime()) ? undefined : parsed);
      } else {
        setCloseDate(undefined);
      }
      setNextStepText(deal.nextStep);
      setIsEditingNextStep(false);
      setIsAddingNextStep(false);
      setNewNextStepDraft("");
    }
  }, [deal]);

  if (!deal) return null;

  const closeDateStr = closeDate ? closeDate.toISOString().slice(0, 10) : "";
  const closeDateChanged = closeDateStr !== (deal.expectedCloseDate?.slice(0, 10) ?? "");

  const handleSaveCloseDate = (): void => {
    onUpdateDeal(deal.id, (d) => ({ ...d, expectedCloseDate: closeDateStr }));
  };

  const handleAddActivity = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const text = activityText.trim();
    if (!text) return;
    const newEntry: ActivityEntry = {
      id: `act-${Date.now()}`,
      content: text,
      author: "You",
      timestamp: new Date().toISOString(),
    };
    onUpdateDeal(deal.id, (d) => ({ ...d, activities: [newEntry, ...d.activities] }));
    onAddActivity(deal.id, text);
    setActivityText("");
  };

  const handleStartEditNextStep = (): void => {
    setNextStepDraft(nextStepText);
    setIsEditingNextStep(true);
  };

  const handleSaveNextStep = (): void => {
    const trimmed = nextStepDraft.trim();
    if (!trimmed) return;
    setNextStepText(trimmed);
    onUpdateDeal(deal.id, (d) => ({ ...d, nextStep: trimmed }));
    onSaveNextStep(deal.id, trimmed);
    setIsEditingNextStep(false);
  };

  const handleCancelEditNextStep = (): void => {
    setIsEditingNextStep(false);
  };

  const handleCompleteNextStep = (): void => {
    const completedEntry: ActivityEntry = {
      id: `act-${Date.now()}`,
      content: t("detail.step-completed-activity", { step: nextStepText }),
      author: "You",
      timestamp: new Date().toISOString(),
      type: "step-completed",
    };
    const completedContent = t("detail.step-completed-activity", { step: nextStepText });
    setNextStepText("");
    setIsEditingNextStep(false);
    onUpdateDeal(deal.id, (d) => ({
      ...d,
      nextStep: "",
      activities: [completedEntry, ...d.activities],
    }));
    onSaveNextStep(deal.id, "");
    onAddActivity(deal.id, completedContent, "step-completed");
  };

  const handleAddNewNextStep = (): void => {
    const trimmed = newNextStepDraft.trim();
    if (!trimmed) return;
    setNextStepText(trimmed);
    setIsAddingNextStep(false);
    setNewNextStepDraft("");
    onUpdateDeal(deal.id, (d) => ({ ...d, nextStep: trimmed }));
    onSaveNextStep(deal.id, trimmed);
  };

  const handleRemoveAssignee = (initials: string): void => {
    onUpdateDeal(deal.id, (d) => ({
      ...d,
      assignees: d.assignees.filter((a) => a !== initials),
    }));
  };

  const handleAddAssignee = (initials: string): void => {
    if (deal.assignees.includes(initials)) return;
    onUpdateDeal(deal.id, (d) => ({ ...d, assignees: [...d.assignees, initials] }));
  };

  const availableToAdd = sellers.filter((s) => !deal.assignees.includes(s.id));
  const otherStages = STAGE_ORDER.filter((s) => s !== deal.status);

  const resolveAuthorName = (author: string): string => {
    const seller = sellers.find((s) => s.memberId === author);
    return seller?.name ?? t("detail.activity-you");
  };

  const activities = [...deal.activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-lg">{deal.title}</DialogTitle>
            <Badge
              variant="secondary"
              className={cn(deal.status === "CLOSED" && "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400")}
            >
              {t(`stages.${deal.status}`)}
            </Badge>
            {deal.linkedDraftId && (
              <Link href="/billing-management" onClick={() => onOpenChange(false)}>
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 cursor-pointer"
                >
                  <FileEdit className="size-3" />
                  {t("detail.linked-draft")}
                </Badge>
              </Link>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-semibold">{deal.company}</p>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Left — deal details */}
          <div className="space-y-4">
            {deal.description && (
              <p className="text-sm text-muted-foreground">{deal.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("detail.amount")}</p>
                <p className="font-semibold">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: deal.currency,
                    maximumFractionDigits: 0,
                  }).format(deal.amount)}
                  <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {deal.currency}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">{t("table.priority")}</p>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                    getPriorityClassName(deal.priority)
                  )}
                >
                  {t(`priorities.${deal.priority}`)}
                </span>
              </div>
            </div>

            {deal.outcome === "PENDING" && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">{t("table.health")}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <Progress
                      className="h-2 flex-1"
                      indicatorClassName={getHealthIndicatorClassName(deal.healthScore)}
                      value={deal.healthScore}
                    />
                    <span className={cn("text-sm font-medium tabular-nums", getHealthTextClassName(deal.healthScore))}>
                      {deal.healthScore}%
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Close date */}
                <div className="space-y-1">
                  <Label htmlFor="modal-close-date" className="text-xs">
                    {t("table.close-date")}
                  </Label>
                  <div className="flex gap-2">
                    <CustomDatePicker
                      value={closeDate}
                      onChange={(date) => setCloseDate(date)}
                      onClear={() => setCloseDate(undefined)}
                    />
                    {closeDateChanged && (
                      <Button size="sm" className="h-8 shrink-0" onClick={handleSaveCloseDate}>
                        {t("detail.save-changes")}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Next step card */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{t("detail.next-step")}</p>

              {nextStepText && !isEditingNextStep && (
                <div className="rounded-md border border-border bg-muted/40 p-3">
                  <p className="text-sm text-foreground">{nextStepText}</p>
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={handleStartEditNextStep}
                    >
                      <Pencil className="size-3" />
                      {t("detail.edit-step")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.4)] hover:bg-[hsl(var(--chart-2)/0.08)]"
                      onClick={handleCompleteNextStep}
                    >
                      <CheckCircle2 className="size-3" />
                      {t("detail.complete-step")}
                    </Button>
                  </div>
                </div>
              )}

              {isEditingNextStep && (
                <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
                  <Input
                    value={nextStepDraft}
                    onChange={(e) => setNextStepDraft(e.target.value)}
                    placeholder={t("new-deal-dialog.placeholders.next-step")}
                    className="h-8 text-sm"
                    maxLength={80}
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 text-xs" onClick={handleSaveNextStep}>
                      {t("detail.save-changes")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleCancelEditNextStep}
                    >
                      {t("detail.cancel-edit")}
                    </Button>
                  </div>
                </div>
              )}

              {!nextStepText && !isEditingNextStep && (
                isAddingNextStep ? (
                  <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                    <Input
                      value={newNextStepDraft}
                      onChange={(e) => setNewNextStepDraft(e.target.value)}
                      placeholder={t("new-deal-dialog.placeholders.next-step")}
                      className="h-8 text-sm"
                      maxLength={80}
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 text-xs" onClick={handleAddNewNextStep}>
                        {t("detail.save-changes")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => { setIsAddingNextStep(false); setNewNextStepDraft(""); }}
                      >
                        {t("detail.cancel-edit")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => setIsAddingNextStep(true)}
                  >
                    <Plus className="size-3" />
                    {t("detail.add-next-step")}
                  </Button>
                )
              )}
            </div>

            <Separator />

            {/* Assignees */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("detail.assignees")}</p>
              <div className="flex flex-wrap gap-1.5">
                {deal.assignees.map((sellerId) => {
                  const seller = sellers.find((s) => s.id === sellerId);
                  return (
                    <span
                      key={sellerId}
                      className="flex items-center gap-1.5 rounded-full bg-muted pl-1 pr-1.5 py-0.5 text-xs font-medium"
                    >
                      <Avatar className="size-4">
                        {seller?.avatarId && (
                          <AvatarImage src={`/api/settings/get-image/${seller.avatarId}`} alt={seller.name} />
                        )}
                        <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                          {seller ? seller.initials : "?"}
                        </AvatarFallback>
                      </Avatar>
                      {seller ? seller.name : sellerId}
                      <button
                        type="button"
                        className="rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                        onClick={() => handleRemoveAssignee(sellerId)}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
              {availableToAdd.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {availableToAdd.map((seller) => (
                    <button
                      key={seller.id}
                      type="button"
                      className="flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors"
                      onClick={() => handleAddAssignee(seller.id)}
                    >
                      <Plus className="size-3" />
                      {seller.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Outcome */}
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("detail.outcome-label")}</p>
              <div className="flex flex-wrap gap-1.5">
                {deal.outcome !== "WON" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10"
                    onClick={() => onMarkOutcome(deal.id, "WON")}
                  >
                    <Trophy className="size-3" />
                    {t("menu.mark-won")}
                  </Button>
                )}
                {deal.outcome !== "LOST" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
                    onClick={() => onMarkOutcome(deal.id, "LOST")}
                  >
                    <XCircle className="size-3" />
                    {t("menu.mark-lost")}
                  </Button>
                )}
                {deal.outcome !== "PENDING" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => onMarkOutcome(deal.id, "PENDING")}
                  >
                    <Undo2 className="size-3" />
                    {t("menu.mark-pending")}
                  </Button>
                )}
              </div>
            </div>

            {/* Move to stage */}
            {otherStages.length > 0 && !(deal.status === "CLOSED" && deal.outcome !== "PENDING") && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{t("menu.move-to")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {otherStages.map((stage) => {
                      const currentIndex = STAGE_ORDER.indexOf(deal.status);
                      const targetIndex = STAGE_ORDER.indexOf(stage);
                      const isForward = targetIndex > currentIndex;
                      return (
                        <Button
                          key={stage}
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => {
                            onMoveToStage(deal.id, stage);
                            onOpenChange(false);
                          }}
                        >
                          {isForward ? <ArrowRight className="size-3" /> : <ArrowLeft className="size-3" />}
                          {t(`stages.${stage}`)}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right — activity log */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">{t("detail.activity")}</p>

            <form className="flex gap-2" onSubmit={handleAddActivity}>
              <Input
                value={activityText}
                onChange={(e) => setActivityText(e.target.value)}
                placeholder={t("detail.activity-placeholder")}
                className="h-8 text-sm"
              />
              <Button type="submit" size="icon" variant="secondary" className="size-8 shrink-0">
                <Send className="size-3.5" />
              </Button>
            </form>

            <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
              {activities.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("detail.no-activity")}
                </p>
              )}
              {activities.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-md border p-2.5",
                    entry.type === "step-completed"
                      ? "border-[hsl(var(--chart-2)/0.3)] bg-[hsl(var(--chart-2)/0.08)]"
                      : "border-border bg-muted/40"
                  )}
                >
                  {entry.type === "step-completed" && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-[hsl(var(--chart-2))]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--chart-2))]">
                        {t("detail.step-done-label")}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{entry.content}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                      <span>{resolveAuthorName(entry.author)}</span>
                    <span>·</span>
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailModal;
