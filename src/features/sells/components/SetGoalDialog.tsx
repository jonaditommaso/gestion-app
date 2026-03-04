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
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import type { DealCurrency } from "../types";

interface SetGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoal: number;
  currentCurrency: DealCurrency;
  availableCurrencies: DealCurrency[];
  onSetGoal: (value: number, currency: DealCurrency) => void;
}

const SetGoalDialog = ({ open, onOpenChange, currentGoal, currentCurrency, availableCurrencies, onSetGoal }: SetGoalDialogProps) => {
  const t = useTranslations("sales");
  const [value, setValue] = useState<string>(String(currentGoal));
  const [currency, setCurrency] = useState<DealCurrency>(
    Array.isArray(availableCurrencies) && availableCurrencies.length > 0
      ? availableCurrencies[0]
      : currentCurrency
  );

  useEffect(() => {
    if (open) {
      const options: DealCurrency[] = Array.isArray(availableCurrencies) && availableCurrencies.length > 0
        ? availableCurrencies
        : [currentCurrency];
      setValue(String(currentGoal));
      if (options.includes(currentCurrency)) {
        setCurrency(currentCurrency);
      } else {
        setCurrency(options[0] ?? currentCurrency);
      }
    }
  }, [open, currentGoal, currentCurrency, availableCurrencies]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    onSetGoal(parsed, currency);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("goal.set-goal")}</DialogTitle>
          <DialogDescription>{t("goal.set-goal-description")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-amount">{t("goal.goal-label")}</Label>
              <Input
                id="goal-amount"
                type="number"
                min="1"
                step="1"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("new-deal-dialog.fields.currency")}</Label>
              <Select value={currency} onValueChange={(v: DealCurrency) => setCurrency(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(availableCurrencies) && availableCurrencies.length > 0
                    ? availableCurrencies
                    : [currentCurrency]
                  ).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("new-deal-dialog.cancel")}
            </Button>
            <Button type="submit">{t("goal.save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetGoalDialog;
