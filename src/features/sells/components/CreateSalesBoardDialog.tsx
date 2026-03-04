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
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useCreateSalesBoard } from "../api/use-create-sales-board";
import type { DealCurrency } from "../types";

const CURRENCIES: DealCurrency[] = ["USD", "EUR", "ARS", "GBP", "BRL", "UYU", "MXN"];

interface CreateSalesBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (boardId: string) => void;
}

const CreateSalesBoardDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateSalesBoardDialogProps) => {
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
    if (!trimmed) return;

    createBoard(
      { json: { name: trimmed, currencies } },
      {
        onSuccess: (response) => {
          const created = "data" in response ? response.data : null;
          setName("");
          setCurrencies(["USD"]);
          onOpenChange(false);
          if (created && "id" in created) {
            onCreated(created.id as string);
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("board.create-title")}</DialogTitle>
          <DialogDescription>{t("board.create-description")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="board-name">{t("board.name-label")}</Label>
            <Input
              id="board-name"
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
                    {active && <X className="size-2.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("new-deal-dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("board.create-button")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSalesBoardDialog;
