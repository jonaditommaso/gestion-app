"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SalesBoard } from "../types";

interface SalesBoardSwitcherProps {
  boards: SalesBoard[];
  selectedBoardId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

const SalesBoardSwitcher = ({
  boards,
  selectedBoardId,
  onSelect,
  onCreateNew,
}: SalesBoardSwitcherProps) => {
  const t = useTranslations("sales");
  const activeBoard = boards.find((b) => b.id === selectedBoardId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="h-8 max-w-44 gap-1.5 truncate font-medium"
        >
          <span className="truncate">{activeBoard?.name ?? t("board.unnamed")}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {boards.map((board) => (
          <DropdownMenuItem
            key={board.id}
            onClick={() => board.id !== selectedBoardId && onSelect(board.id)}
            className="flex items-center gap-2"
          >
            <Check
              className={`size-4 shrink-0 ${board.id === selectedBoardId ? "opacity-100" : "opacity-0"}`}
            />
            <span className="truncate">{board.name}</span>
          </DropdownMenuItem>
        ))}
        {boards.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={onCreateNew}
        >
          <Plus className="size-4 shrink-0" />
          {t("board.new-board")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SalesBoardSwitcher;
