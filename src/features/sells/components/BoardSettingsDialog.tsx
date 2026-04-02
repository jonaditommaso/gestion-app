"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useUpdateSalesBoard } from "../api/use-update-sales-board";
import type { DealCurrency, SalesBoard } from "../types";
import { Users, CalendarDays, X } from "lucide-react";

const CURRENCIES: DealCurrency[] = ["USD", "EUR", "ARS", "GBP", "BRL", "UYU", "MXN"];

interface BoardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: SalesBoard;
  sellerCount: number;
}

const BoardSettingsDialog = ({
  open,
  onOpenChange,
  board,
  sellerCount,
}: BoardSettingsDialogProps) => {
  const t = useTranslations("sales");
  const locale = useLocale();
  const [name, setName] = useState<string>(board.name);
  const [currencies, setCurrencies] = useState<DealCurrency[]>(
    Array.isArray(board.currencies) ? board.currencies : [board.currencies]
  );
  const { mutate: updateBoard, isPending } = useUpdateSalesBoard();

  const formattedDate = new Date(board.createdAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
    if (!trimmed || currencies.length === 0) return;

    updateBoard(
      { param: { boardId: board.id }, json: { name: trimmed, currencies } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("board.settings-title")}</DialogTitle>
          <DialogDescription>{t("board.settings-description")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="settings-board-name">{t("board.name-label")}</Label>
            <Input
              id="settings-board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("board.name-placeholder")}
              required
              autoFocus
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
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    )}
                  >
                    {c}
                    {active && currencies.length > 1 && <X className="size-2.5" />}
                  </button>
                );
              })}
            </div>
            {currencies.length === 0 && (
              <p className="text-xs text-destructive">{t("board.currencies-min-error")}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-3.5 shrink-0" />
              <span>{t("board.settings-sellers-count", { count: sellerCount })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" />
              <span>
                {t("board.settings-active-since")}: <span className="text-foreground">{formattedDate}</span>
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("new-deal-dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isPending || currencies.length === 0}>
              {isPending ? t("board.creating") : t("board.settings-save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BoardSettingsDialog;
