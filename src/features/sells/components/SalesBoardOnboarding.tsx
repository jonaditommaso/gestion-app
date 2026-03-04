"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { KanbanSquare, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useCreateSalesBoard } from "../api/use-create-sales-board";
import type { DealCurrency } from "../types";

const CURRENCIES: DealCurrency[] = ["USD", "EUR", "ARS", "GBP", "BRL", "UYU", "MXN"];

interface SalesBoardOnboardingProps {
  onCreated: (boardId: string) => void;
}

const SalesBoardOnboarding = ({ onCreated }: SalesBoardOnboardingProps) => {
  const t = useTranslations("sales");
  const [name, setName] = useState<string>("");
  const [currencies, setCurrencies] = useState<DealCurrency[]>(["USD"]);
  const { mutate: createBoard, isPending } = useCreateSalesBoard();

  const toggleCurrency = (c: DealCurrency): void => {
    setCurrencies((prev) => {
      if (prev.includes(c)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== c);
      }
      return [...prev, c];
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isPending) return;

    createBoard(
      { json: { name: trimmed, currencies } },
      {
        onSuccess: (response) => {
          const created = "data" in response ? response.data : null;
          if (created && "id" in created) {
            onCreated(created.id as string);
          }
        },
      }
    );
  };

  return (
    <div className="fixed top-20 left-14 right-0 bottom-0 z-20 flex items-center justify-center">
      {/* Backdrop — only covers the main content area, not navbar/sidebar */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border bg-card shadow-2xl",
          "mx-4 px-8 py-10"
        )}
      >
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <KanbanSquare className="size-8 text-primary" />
          </span>
        </div>

        {/* Heading */}
        <h2 className="mb-2 text-center text-xl font-semibold tracking-tight">
          {t("board.onboarding-title")}
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {t("board.onboarding-description")}
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="ob-board-name">{t("board.name-label")}</Label>
            <Input
              id="ob-board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("board.name-placeholder")}
              disabled={isPending}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("board.currencies-label")}</Label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => {
                const active = currencies.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCurrency(c)}
                    disabled={isPending}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-medium transition-colors disabled:opacity-50",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    )}
                  >
                    {c}
                    {active && <X className="size-2.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isPending || !name.trim()}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {isPending ? t("board.creating") : t("board.create-button")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SalesBoardOnboarding;
