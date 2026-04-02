'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowRightLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetSalesBoards } from "@/features/sells/api/use-get-sales-boards";
import { useGetDealSellers } from "@/features/sells/api/use-get-deal-sellers";
import { useCreateDeal } from "@/features/sells/api/use-create-deal";
import { useAddDealAssignee } from "@/features/sells/api/use-add-deal-assignee";
import { useHomeCustomization } from "@/features/home/components/customization";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TooltipContainer } from "@/components/TooltipContainer";
import { cn } from "@/lib/utils";
import type { Seller, SalesBoard, DealCurrency } from "@/features/sells/types";
import dynamic from "next/dynamic";
import type { CreateDealFormValues } from "@/features/sells/components/CreateDealDialog";

const CreateDealDialog = dynamic(
    () => import("@/features/sells/components/CreateDealDialog"),
    { loading: () => <></> }
);

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

const CreateDealButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const t = useTranslations('home');
    const { config, setDefaultBoardId } = useHomeCustomization();

    const { data: boardsData } = useGetSalesBoards();
    const { data: sellersData } = useGetDealSellers();
    const { mutate: createDeal } = useCreateDeal();
    const { mutate: addAssignee } = useAddDealAssignee();

    const boards = (boardsData?.documents ?? []) as unknown as SalesBoard[];

    const selectedBoard: SalesBoard | undefined =
        boards.find((b) => b.id === config.defaultBoardId) ?? boards[0];

    const hasMultiple = boards.length > 1;
    const actionDisabled = boardsData !== undefined && boards.length === 0;

    const availableCurrencies: DealCurrency[] = selectedBoard?.currencies?.length
        ? selectedBoard.currencies
        : ["USD"];

    const sellers: Seller[] = (sellersData?.documents ?? []).map((doc) => ({
        id: String((doc as Record<string, unknown>)['$id'] ?? ''),
        memberId: String((doc as Record<string, unknown>)['memberId'] ?? ''),
        name: String((doc as Record<string, unknown>)['name'] ?? ''),
        initials: getInitials(String((doc as Record<string, unknown>)['name'] ?? '')),
        avatarId: ((doc as Record<string, unknown>)['avatarId'] as string | null) ?? null,
    }));

    const handleCreateDeal = (values: CreateDealFormValues) => {
        const { assigneeIds, ...dealData } = values;
        createDeal(
            { json: dealData },
            {
                onSuccess: (response) => {
                    if ("data" in response && response.data && "id" in response.data && assigneeIds.length > 0) {
                        const dealId = response.data.id as string;
                        const sellerIdToMemberId = Object.fromEntries(sellers.map((s) => [s.id, s.memberId]));
                        for (const sellerId of assigneeIds) {
                            const memberId = sellerIdToMemberId[sellerId];
                            if (memberId) {
                                addAssignee({ param: { dealId }, json: { memberId } });
                            }
                        }
                    }
                    setIsOpen(false);
                },
            }
        );
    };

    const handleOpen = () => {
        if (actionDisabled) return;
        setIsOpen(true);
    };

    const Trigger = (
        <Button
            className={cn("w-full h-28 flex-col gap-1", actionDisabled ? 'opacity-50 cursor-default hover:bg-transparent' : '')}
            variant="outline"
            onClick={handleOpen}
        >
                <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4" />
                    <span>{t('new-deal')}</span>
                </div>
                {selectedBoard && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-muted-foreground truncate max-w-full">
                            {selectedBoard.name}
                        </span>
                        {hasMultiple && (
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPopoverOpen(true);
                                        }}
                                    >
                                        <ArrowRightLeft className="h-3 w-3" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="center">
                                    {boards.map((board) => (
                                        <button
                                            key={board.id}
                                            className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors truncate block ${board.id === selectedBoard.id ? 'font-semibold' : ''}`}
                                            onClick={() => {
                                                setDefaultBoardId(board.id);
                                                setPopoverOpen(false);
                                            }}
                                        >
                                            {board.name}
                                        </button>
                                    ))}
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}
        </Button>
    );

    return (
        <>
            {isOpen && (
                <CreateDealDialog
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    onCreateDeal={handleCreateDeal}
                    availableCurrencies={availableCurrencies}
                    sellers={sellers}
                />
            )}

            {actionDisabled
                ? (
                    <TooltipContainer tooltipText={t('no-boards')}>
                        {Trigger}
                    </TooltipContainer>
                )
                : (
                    <div>{Trigger}</div>
                )
            }
        </>
    );
};

export default CreateDealButton;
