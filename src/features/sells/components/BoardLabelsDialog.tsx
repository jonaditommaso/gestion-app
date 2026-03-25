"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LABEL_COLORS, MAX_LABEL_NAME_LENGTH } from "@/app/workspaces/constants/label-colors";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useUpdateSalesBoard } from "../api/use-update-sales-board";
import type { BoardLabel, SalesBoard } from "../types";
import { useConfirm } from "@/hooks/use-confirm";

interface BoardLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: SalesBoard;
}

const BoardLabelsDialog = ({ open, onOpenChange, board }: BoardLabelsDialogProps) => {
  const t = useTranslations("sales");
  const { mutate: updateBoard } = useUpdateSalesBoard();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
    t("labels.delete-confirm-title"),
    t("labels.delete-confirm-message"),
    "destructive"
  );

  const [optimisticLabels, setOptimisticLabels] = useState<BoardLabel[]>(
    () => board.labels ?? []
  );
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setOptimisticLabels(board.labels ?? []);
  }, [board.labels]);

  const getLabelByColor = (color: string): BoardLabel | undefined =>
    optimisticLabels.find((l) => l.color === color);

  const getInputValue = (color: string): string => {
    if (inputValues[color] !== undefined) return inputValues[color];
    return getLabelByColor(color)?.name ?? "";
  };

  const saveLabels = (
    updatedLabels: BoardLabel[],
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    updateBoard(
      {
        param: { boardId: board.id },
        json: { labels: JSON.stringify(updatedLabels) },
      },
      {
        onSuccess,
        onError,
      }
    );
  };

  const handleLabelChange = (color: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [color]: value }));
  };

  const handleLabelBlur = (color: string) => {
    const value = inputValues[color];
    if (value === undefined) return;

    const existingLabel = getLabelByColor(color);
    const trimmedValue = value.trim();

    setInputValues((prev) => {
      const next = { ...prev };
      delete next[color];
      return next;
    });

    if (!trimmedValue && existingLabel) return;
    if (!trimmedValue && !existingLabel) return;
    if (existingLabel && existingLabel.name === trimmedValue) return;

    let updatedLabels: BoardLabel[];

    if (existingLabel) {
      updatedLabels = optimisticLabels.map((l) =>
        l.id === existingLabel.id ? { ...l, name: trimmedValue } : l
      );
    } else {
      const newLabel: BoardLabel = {
        id: `BLABEL_${Date.now()}`,
        name: trimmedValue,
        color,
      };
      updatedLabels = [...optimisticLabels, newLabel];
    }

    setOptimisticLabels(updatedLabels);

    saveLabels(
      updatedLabels,
      () => {
        toast.success(existingLabel ? t("labels.updated") : t("labels.created"));
      },
      () => {
        setOptimisticLabels(board.labels ?? []);
      }
    );
  };

  const handleDeleteLabel = async (color: string) => {
    const existingLabel = getLabelByColor(color);
    if (!existingLabel) return;

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    const updatedLabels = optimisticLabels.filter((l) => l.id !== existingLabel.id);
    setOptimisticLabels(updatedLabels);

    setInputValues((prev) => {
      const next = { ...prev };
      delete next[color];
      return next;
    });

    saveLabels(
      updatedLabels,
      () => {
        toast.success(t("labels.deleted"));
      },
      () => {
        setOptimisticLabels(board.labels ?? []);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, color: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRefs.current[color]?.blur();
    } else if (e.key === "Escape") {
      setInputValues((prev) => {
        const next = { ...prev };
        delete next[color];
        return next;
      });
      inputRefs.current[color]?.blur();
    }
  };

  return (
    <>
      <ConfirmDeleteDialog />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("labels.dialog-title")}</DialogTitle>
            <DialogDescription>{t("labels.dialog-description")}</DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="space-y-2 pt-1">
            {LABEL_COLORS.map((colorDef) => {
              const existingLabel = getLabelByColor(colorDef.value);
              const inputValue = getInputValue(colorDef.value);

              return (
                <div
                  key={colorDef.value}
                  className="group relative flex items-center"
                >
                  <input
                    ref={(el) => {
                      inputRefs.current[colorDef.value] = el;
                    }}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleLabelChange(colorDef.value, e.target.value)}
                    onBlur={() => handleLabelBlur(colorDef.value)}
                    onKeyDown={(e) => handleKeyDown(e, colorDef.value)}
                    maxLength={MAX_LABEL_NAME_LENGTH}
                    className={cn(
                      "w-full h-9 px-3 pr-8 rounded-md text-sm font-medium transition-all",
                      "border-0 outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                    style={{
                      backgroundColor: colorDef.value,
                      color: colorDef.textColor,
                    }}
                  />
                  {existingLabel && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLabel(colorDef.value)}
                      className={cn(
                        "absolute right-2 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                        "hover:bg-black/10"
                      )}
                      style={{ color: colorDef.textColor }}
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            {optimisticLabels.length}/{LABEL_COLORS.length} {t("labels.used-count")}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BoardLabelsDialog;
