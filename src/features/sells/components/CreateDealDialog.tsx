"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import CustomDatePicker from "@/components/CustomDatePicker";
import { TooltipContainer } from "@/components/TooltipContainer";
import { LABEL_COLORS, MAX_LABEL_NAME_LENGTH } from "@/app/workspaces/constants/label-colors";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ChevronDown, Tag, UserX, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { BoardLabel, DealCurrency, DealStage, Seller, WorkItemPriority } from "../types";

export type CreateDealFormValues = {
  title: string;
  description: string;
  company: string;
  companyResponsabileName: string;
  companyResponsabileEmail: string;
  companyResponsabilePhoneNumber: string;
  amount: number;
  currency: DealCurrency;
  priority: WorkItemPriority;
  status: DealStage;
  expectedCloseDate: string | null;
  nextStep: string;
  assigneeIds: string[];
  labelId: string | null;
};

type FormErrors = {
  title?: string;
  company?: string;
  amount?: string;
};

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDeal: (values: CreateDealFormValues) => void;
  availableCurrencies?: DealCurrency[];
  sellers?: Seller[];
  initialStage?: DealStage;
  boardLabels?: BoardLabel[];
  onCreateLabel?: (label: Omit<BoardLabel, "id">) => void;
}

const CreateDealDialog = ({
  open,
  onOpenChange,
  onCreateDeal,
  availableCurrencies,
  sellers = [],
  initialStage = "LEADS",
  boardLabels = [],
  onCreateLabel,
}: CreateDealDialogProps) => {
  const t = useTranslations("sales");
  const currencyList: DealCurrency[] = Array.isArray(availableCurrencies) ? availableCurrencies : [];
  const defaultCurrency: DealCurrency = currencyList[0] ?? "USD";
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [companyResponsabileName, setCompanyResponsabileName] = useState<string>("");
  const [companyResponsabileEmail, setCompanyResponsabileEmail] = useState<string>("");
  const [companyResponsabilePhoneNumber, setCompanyResponsabilePhoneNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<DealCurrency>(defaultCurrency);
  const [priority, setPriority] = useState<WorkItemPriority>(2);
  const [status, setStatus] = useState<DealStage>(initialStage);
  const [closeDate, setCloseDate] = useState<Date | undefined>(undefined);
  const [nextStep, setNextStep] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [newLabelColor, setNewLabelColor] = useState<string>("");
  const [newLabelName, setNewLabelName] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setCompany("");
      setCompanyResponsabileName("");
      setCompanyResponsabileEmail("");
      setCompanyResponsabilePhoneNumber("");
      setAmount("");
      setCurrency(Array.isArray(availableCurrencies) && availableCurrencies.length > 0 ? availableCurrencies[0] : "USD");
      setPriority(2);
      setCloseDate(undefined);
      setNextStep("");
      setSelectedAssignees([]);
      setSelectedLabelId(null);
      setNewLabelColor("");
      setNewLabelName("");
      setErrors({});
    }
  }, [open, availableCurrencies]);

  useEffect(() => {
    if (open) {
      setStatus(initialStage);
      setCurrency(Array.isArray(availableCurrencies) && availableCurrencies.length > 0 ? availableCurrencies[0] : "USD");
    }
  }, [open, initialStage, availableCurrencies]);

  const toggleAssignee = (sellerId: string): void => {
    setSelectedAssignees((prev) =>
      prev.includes(sellerId) ? prev.filter((id) => id !== sellerId) : [...prev, sellerId]
    );
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = t("new-deal-dialog.errors.title-required");
    if (!company.trim()) errs.company = t("new-deal-dialog.errors.company-required");
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = t("new-deal-dialog.errors.amount-required");
    }
    return errs;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onCreateDeal({
      title: title.trim(),
      description: description.trim() || t("new-deal-default-description"),
      company: company.trim(),
      companyResponsabileName: companyResponsabileName.trim(),
      companyResponsabileEmail: companyResponsabileEmail.trim(),
      companyResponsabilePhoneNumber: companyResponsabilePhoneNumber.trim(),
      amount: Number(amount),
      currency,
      priority,
      status,
      expectedCloseDate: closeDate
        ? closeDate.toISOString().slice(0, 10)
        : "",
      nextStep: nextStep.trim(),
      assigneeIds: selectedAssignees,
      labelId: selectedLabelId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t("new-deal-dialog.title")}</DialogTitle>
          <DialogDescription>{t("new-deal-dialog.description")}</DialogDescription>
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
          <div className="space-y-1.5">
            <Label htmlFor="deal-title">
              {t("new-deal-dialog.fields.title")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((e) => ({ ...e, title: undefined }));
              }}
              placeholder={t("new-deal-dialog.placeholders.title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deal-description">{t("new-deal-dialog.fields.description")}</Label>
            <Input
              id="deal-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("new-deal-dialog.placeholders.description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="space-y-1.5">
              <Label htmlFor="deal-company">
                {t("new-deal-dialog.fields.company")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deal-company"
                value={company}
                onChange={(event) => {
                  setCompany(event.target.value);
                  setErrors((e) => ({ ...e, company: undefined }));
                }}
                placeholder={t("new-deal-dialog.placeholders.company")}
                className={errors.company ? "border-destructive" : ""}
              />
              {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-responsible-name">{t("new-deal-dialog.fields.responsible-name")}</Label>
              <Input
                id="deal-responsible-name"
                value={companyResponsabileName}
                onChange={(event) => setCompanyResponsabileName(event.target.value)}
                placeholder={t("new-deal-dialog.placeholders.responsible-name")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deal-responsible-email">{t("new-deal-dialog.fields.responsible-email")}</Label>
              <Input
                id="deal-responsible-email"
                type="email"
                value={companyResponsabileEmail}
                onChange={(event) => setCompanyResponsabileEmail(event.target.value)}
                placeholder={t("new-deal-dialog.placeholders.responsible-email")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-responsible-phone">{t("new-deal-dialog.fields.responsible-phone")}</Label>
              <Input
                id="deal-responsible-phone"
                type="tel"
                value={companyResponsabilePhoneNumber}
                onChange={(event) => setCompanyResponsabilePhoneNumber(event.target.value)}
                placeholder={t("new-deal-dialog.placeholders.responsible-phone")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-start">
            <div className="space-y-1.5">
              <Label htmlFor="deal-amount">
                {t("new-deal-dialog.fields.amount")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deal-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setErrors((e) => ({ ...e, amount: undefined }));
                }}
                placeholder="12000"
                className={errors.amount ? "border-destructive" : ""}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t("new-deal-dialog.fields.currency")}</Label>
              <Select value={currency} onValueChange={(value: DealCurrency) => setCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyList.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("new-deal-dialog.fields.stage")}</Label>
              <Select value={status} onValueChange={(value: DealStage) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEADS">{t("stages.LEADS")}</SelectItem>
                  <SelectItem value="QUALIFICATION">{t("stages.QUALIFICATION")}</SelectItem>
                  <SelectItem value="NEGOTIATION">{t("stages.NEGOTIATION")}</SelectItem>
                  <SelectItem value="CLOSED">{t("stages.CLOSED")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-start">
            <div className="space-y-1.5">
              <Label>{t("new-deal-dialog.fields.priority")}</Label>
              <Select value={String(priority)} onValueChange={(value) => setPriority(Number(value) as WorkItemPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <span className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                      {t("priorities.1")}
                    </span>
                  </SelectItem>
                  <SelectItem value="2">
                    <span className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full bg-yellow-500" />
                      {t("priorities.2")}
                    </span>
                  </SelectItem>
                  <SelectItem value="3">
                    <span className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full bg-red-500" />
                      {t("priorities.3")}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("labels.field-label")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-accent"
                  >
                    {selectedLabelId ? (() => {
                      const lbl = boardLabels.find((l) => l.id === selectedLabelId);
                      if (!lbl) return <span className="text-muted-foreground truncate">{t("labels.none")}</span>;
                      const colorDef = LABEL_COLORS.find((c) => c.value === lbl.color);
                      return (
                        <span
                          className="truncate rounded px-1.5 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: lbl.color, color: colorDef?.textColor ?? "#000" }}
                        >
                          {lbl.name}
                        </span>
                      );
                    })() : (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Tag className="size-3.5 shrink-0" />
                        <span className="truncate text-sm">{t("labels.none")}</span>
                      </span>
                    )}
                    <ChevronDown className="size-3.5 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-1" align="start">
                  <button
                    type="button"
                    onClick={() => setSelectedLabelId(null)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                      selectedLabelId === null && "font-medium"
                    )}
                  >
                    <X className="size-3.5 text-muted-foreground" />
                    {t("labels.none")}
                  </button>
                  {boardLabels.map((lbl) => {
                    const colorDef = LABEL_COLORS.find((c) => c.value === lbl.color);
                    return (
                      <button
                        key={lbl.id}
                        type="button"
                        onClick={() => setSelectedLabelId(lbl.id === selectedLabelId ? null : lbl.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                          selectedLabelId === lbl.id && "font-medium"
                        )}
                      >
                        <span
                          className="inline-block size-3 rounded-sm shrink-0"
                          style={{ backgroundColor: lbl.color }}
                        />
                        <span
                          className="truncate rounded px-1 text-xs font-medium"
                          style={{ backgroundColor: lbl.color, color: colorDef?.textColor ?? "#000" }}
                        >
                          {lbl.name}
                        </span>
                      </button>
                    );
                  })}
                  {onCreateLabel && (
                    <>
                      <div className="my-1 border-t" />
                      <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("labels.create-new")}
                      </p>
                      <div className="flex flex-wrap gap-1 px-2 pb-1">
                        {LABEL_COLORS.map((colorDef) => (
                          <button
                            key={colorDef.value}
                            type="button"
                            onClick={() => setNewLabelColor(colorDef.value)}
                            className={cn(
                              "size-5 rounded transition-transform hover:scale-110",
                              newLabelColor === colorDef.value && "ring-2 ring-offset-1 ring-foreground"
                            )}
                            style={{ backgroundColor: colorDef.value }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-1 px-2 pb-2">
                        <Input
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder={t("labels.input-placeholder")}
                          maxLength={MAX_LABEL_NAME_LENGTH}
                          className="h-7 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 shrink-0 px-2 text-xs"
                          disabled={!newLabelColor || !newLabelName.trim()}
                          onClick={() => {
                            if (!newLabelColor || !newLabelName.trim()) return;
                            onCreateLabel({ name: newLabelName.trim(), color: newLabelColor });
                            setNewLabelName("");
                            setNewLabelColor("");
                          }}
                        >
                          {t("labels.create-button")}
                        </Button>
                      </div>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>{t("new-deal-dialog.fields.assignees")}</Label>
              {sellers.length === 0 ? (
                <TooltipContainer tooltipText={t("new-deal-dialog.fields.no-assignees")} side="top">
                  <button
                    type="button"
                    disabled
                    className="flex h-9 w-full cursor-not-allowed items-center gap-2 rounded-md border border-input bg-muted px-3 text-xs text-muted-foreground opacity-60"
                  >
                    <UserX className="size-3.5 shrink-0" />
                    <span className="truncate">{t("new-deal-dialog.fields.assignees")}</span>
                  </button>
                </TooltipContainer>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent"
                    >
                      <span className="truncate">
                        {selectedAssignees.length === 0
                          ? t("new-deal-dialog.fields.no-sellers-selected")
                          : sellers
                              .filter((s) => selectedAssignees.includes(s.id))
                              .map((s) => s.name)
                              .join(", ")}
                      </span>
                      <ChevronDown className="size-3.5 shrink-0 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start">
                    {sellers.map((seller) => (
                      <label
                        key={seller.id}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedAssignees.includes(seller.id)}
                          onCheckedChange={() => toggleAssignee(seller.id)}
                        />
                        <span className="truncate">{seller.name}</span>
                      </label>
                    ))}
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("new-deal-dialog.fields.close-date")}</Label>
              <CustomDatePicker
                value={closeDate}
                onChange={(date) => setCloseDate(date)}
                onClear={() => setCloseDate(undefined)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-next-step">{t("new-deal-dialog.fields.next-step")}</Label>
              <Input
                id="deal-next-step"
                value={nextStep}
                onChange={(event) => setNextStep(event.target.value)}
                placeholder={t("new-deal-dialog.placeholders.next-step")}
                maxLength={60}
              />
            </div>
          </div>
          </div>

          <div className="mt-2 flex shrink-0 justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("new-deal-dialog.cancel")}
            </Button>
            <Button type="submit">{t("new-deal-dialog.submit")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDealDialog;