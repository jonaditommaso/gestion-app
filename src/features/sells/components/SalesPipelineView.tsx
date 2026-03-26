"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import CustomDatePicker from "@/components/CustomDatePicker";
import { Slider } from "@/components/ui/slider";
import { useLocale, useTranslations } from "next-intl";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import {
  Activity,
  ArrowDownUp,
  CalendarDays,
  ChartLine,
  Circle,
  Clock3,
  Eye,
  Filter,
  History,
  KanbanSquare,
  Plus,
  Search,
  Settings,
  Settings2,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  MoreVertical,
  Undo2,
  Users,
  HeartHandshake,
  Loader,
  XCircle,
  CirclePile,
} from "lucide-react";
import { useEffect, useState } from "react";
import CreateDealDialog, { type CreateDealFormValues } from "./CreateDealDialog";
import DealDetailModal from "./DealDetailModal";
import DealHealthDialog from "./DealHealthDialog";
import GoalHistoryDialog from "./GoalHistoryDialog";
import SetGoalDialog from "./SetGoalDialog";
import ManageSellersDialog from "./ManageSellersDialog";
import SalesChartsTab from "./SalesChartsTab";
import SalesBoardSwitcher from "./SalesBoardSwitcher";
import CreateSalesBoardDialog from "./CreateSalesBoardDialog";
import SalesBoardOnboarding from "./SalesBoardOnboarding";
import BoardSettingsDialog from "./BoardSettingsDialog";
import BoardLabelsDialog from "./BoardLabelsDialog";
import UpgradeDialog from "@/components/UpgradeDialog";
import { LABEL_COLORS } from "@/app/workspaces/constants/label-colors";
import type { BoardLabel, Deal, DealCurrency, DealStage, DealOutcome, Seller, SalesBoard, SalesGoal, WorkItemPriority, ActivityEntry } from "../types";
import { computeHealthScore } from "../utils/health";
import { useGetSalesBoards } from "../api/use-get-sales-boards";
import { useGetSalesGoals } from "../api/use-get-sales-goals";
import { useSetSalesGoal } from "../api/use-set-sales-goal";
import { useGetDeals } from "../api/use-get-deals";
import { useGetDealSellers } from "../api/use-get-deal-sellers";
import { useCreateDeal } from "../api/use-create-deal";
import { useDeleteDeal } from "../api/use-delete-deal";
import { useUpdateDeal } from "../api/use-update-deal";
import { useUpdateSalesBoard } from "../api/use-update-sales-board";
import { useCreateDealSeller } from "../api/use-create-deal-seller";
import { useDeleteDealSeller } from "../api/use-delete-deal-seller";
import { useAddDealAssignee } from "../api/use-add-deal-assignee";
import { useAddDealActivity } from "../api/use-add-deal-activity";
import { useGetSellSquads } from "../api/use-get-sell-squads";
import ManageSellSquadsDialog from "./ManageSellSquadsDialog";
import type { SellSquad } from "../types";

const STAGE_ORDER: DealStage[] = ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"];

const groupDealsByStage = (items: Deal[]): Record<DealStage, Deal[]> => {
  return {
    LEADS: items.filter((deal) => deal.status === "LEADS"),
    QUALIFICATION: items.filter((deal) => deal.status === "QUALIFICATION"),
    NEGOTIATION: items.filter((deal) => deal.status === "NEGOTIATION"),
    CLOSED: items.filter((deal) => deal.status === "CLOSED"),
  };
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

type ServerDealDocument = {
  id: string;
  title: string;
  description: string;
  company: string;
  companyResponsabileName: string;
  companyResponsabileEmail: string;
  companyResponsabilePhoneNumber: string;
  status: DealStage;
  amount: number;
  currency: DealCurrency;
  priority: WorkItemPriority;
  expectedCloseDate: string | null;
  lastStageChangedAt: string | null;
  outcome: string;
  nextStep: string;
  linkedDraftId: string | null;
  labelId: string | null;
  assignees: Array<{ id: string; memberId: string; name: string; email: string; avatarId: string | null }>;
  activities: ActivityEntry[];
};



type ServerSellerDocument = {
  $id: string;
  memberId: string;
  name: string;
  email: string;
  avatarId: string | null;
};

type TableSortKey = "company" | "priority" | "value" | "health";
type SortDirection = "asc" | "desc";
const SalesPipelineView = () => {
  const t = useTranslations("sales");
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const locale = useLocale();
  const [boardDeals, setBoardDeals] = useState<Record<DealStage, Deal[]>>(() =>
    groupDealsByStage([])
  );
  const [isCreateDealOpen, setIsCreateDealOpen] = useState<boolean>(false);
  const [createDealStage, setCreateDealStage] = useState<DealStage>("LEADS");
  const [pipelineQuery, setPipelineQuery] = useState<string>("");
  const [tableQuery, setTableQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<TableSortKey>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<DealCurrency | "all">("all");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState<boolean>(false);
  const [isSetGoalOpen, setIsSetGoalOpen] = useState<boolean>(false);
  const [isGoalHistoryOpen, setIsGoalHistoryOpen] = useState<boolean>(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [healthDialogDeal, setHealthDialogDeal] = useState<Deal | null>(null);
  const [isManageSellersOpen, setIsManageSellersOpen] = useState<boolean>(false);
  const [isManageSellSquadsOpen, setIsManageSellSquadsOpen] = useState<boolean>(false);
  const [selectedSquadFilter, setSelectedSquadFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState<boolean>(false);
  const [isBoardLabelsOpen, setIsBoardLabelsOpen] = useState<boolean>(false);
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string | "all">("all");
  const [tableStageFilter, setTableStageFilter] = useState<DealStage[]>([...STAGE_ORDER]);
  const [tablePriorityFilter, setTablePriorityFilter] = useState<WorkItemPriority[]>([1, 2, 3]);
  const [tableOutcomeFilter, setTableOutcomeFilter] = useState<DealOutcome[]>(["PENDING", "WON", "LOST"]);
  const [pendingHealthRange, setPendingHealthRange] = useState<[number, number]>([0, 100]);
  const [activeHealthRange, setActiveHealthRange] = useState<[number, number]>([0, 100]);
  const pageSize = 3;

  const { data: boardsData, isLoading: isLoadingBoards } = useGetSalesBoards();
  const { data: goalsData } = useGetSalesGoals(selectedBoardId);
  const { mutate: mutateSetGoal } = useSetSalesGoal();
  const { data: dealsData } = useGetDeals();
  const { data: sellersData } = useGetDealSellers();
  const { data: sellSquadsData } = useGetSellSquads();
  const { mutate: createDealMutation } = useCreateDeal();
  const { mutate: deleteDealMutation } = useDeleteDeal();
  const { mutate: updateDealMutation } = useUpdateDeal();
  const { mutate: updateBoardMutation } = useUpdateSalesBoard();
  const { mutate: createSellerMutation } = useCreateDealSeller();
  const { mutate: deleteSellerMutation } = useDeleteDealSeller();
  const { mutate: addAssigneeMutation } = useAddDealAssignee();
  const { mutate: addActivityMutation } = useAddDealActivity();

  const { isFree, limits, plan } = usePlanAccess();
  const boards: SalesBoard[] = (boardsData?.documents ?? []) as SalesBoard[];
  const isPro = plan === 'PRO' || plan === 'ENTERPRISE';
  const isAtBoardLimit = limits.pipelines !== -1 && boards.length >= limits.pipelines;
  const selectedBoard: SalesBoard | undefined = boards.find((b) => b.id === selectedBoardId);
  const boardLabels: BoardLabel[] = selectedBoard?.labels ?? [];
  const goals: SalesGoal[] = (goalsData?.documents ?? []) as SalesGoal[];
  const activeGoal: SalesGoal | undefined = goals[0];
  const goalCurrency: DealCurrency = ((activeGoal?.currency ?? "USD") as DealCurrency);

  const sellSquads = (sellSquadsData?.documents ?? []) as SellSquad[];
  const selectedSquadDealIds: string[] | null = selectedSquadFilter !== "all"
    ? (sellSquads.find(sq => sq.$id === selectedSquadFilter)?.dealIds ?? [])
    : null;

  const sellers: Seller[] = ((sellersData as { documents: ServerSellerDocument[] } | undefined)?.documents ?? []).map(
    (doc) => ({
      id: doc.$id,
      memberId: doc.memberId,
      name: doc.name,
      initials: getInitials(doc.name),
      avatarId: doc.avatarId,
    })
  );

  useEffect(() => {
    const docs = boardsData?.documents ?? [];
    const firstBoard = docs[0];
    const isCurrentValid = docs.some((b) => (b as { id: string }).id === selectedBoardId);
    if (!isCurrentValid && firstBoard) {
      setSelectedBoardId((firstBoard as { id: string }).id);
    }
  }, [boardsData, selectedBoardId]);

  useEffect(() => {
    const docs = (dealsData as { documents: ServerDealDocument[] } | undefined)?.documents;
    if (!docs) return;
    const mapped: Deal[] = docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      assignees: doc.assignees.map((a) => a.memberId),
      amount: doc.amount,
      currency: doc.currency,
      contactId: doc.id,
      companyResponsabileName: doc.companyResponsabileName,
      companyResponsabileEmail: doc.companyResponsabileEmail,
      companyResponsabilePhoneNumber: doc.companyResponsabilePhoneNumber,
      company: doc.company,
      expectedCloseDate: doc.expectedCloseDate,
      lastStageChangedAt: doc.lastStageChangedAt,
      ...computeHealthScore(doc),
      priority: doc.priority,
      nextStep: doc.nextStep,
      outcome: (doc.outcome as DealOutcome) ?? "PENDING",
      linkedDraftId: doc.linkedDraftId ?? null,
      labelId: doc.labelId ?? null,
      activities: doc.activities,
    }));
    setBoardDeals(groupDealsByStage(mapped));
  }, [dealsData]);

  const allDeals = STAGE_ORDER.flatMap((stage) => boardDeals[stage]);

  const formatCurrency = (value: number, currency: DealCurrency | "USD" = "USD"): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const pipelineTotal = allDeals.reduce((acc, deal) => acc + deal.amount, 0);
  const wonAmount = allDeals
    .filter((deal) => deal.outcome === "WON")
    .reduce((acc, deal) => acc + deal.amount, 0);
  const wonDeals = allDeals.filter((deal) => deal.outcome === "WON").length;
  const resolvedDeals = allDeals.filter((deal) => deal.outcome !== "PENDING").length;
  const conversionRate = resolvedDeals > 0 ? Number(((wonDeals / resolvedDeals) * 100).toFixed(1)) : 0;

  const monthlyGoal = activeGoal?.targetAmount ?? 0;
  const goalProgress = monthlyGoal > 0 ? Math.min(100, Math.round((wonAmount / monthlyGoal) * 100)) : 0;

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

  const wonThisMonth = allDeals
    .filter((d) => d.outcome === "WON" && !!d.expectedCloseDate && d.expectedCloseDate >= currentMonthStart)
    .reduce((acc, d) => acc + d.amount, 0);
  const wonPrevMonth = allDeals
    .filter((d) => d.outcome === "WON" && !!d.expectedCloseDate && d.expectedCloseDate >= prevMonthStart && d.expectedCloseDate <= prevMonthEnd)
    .reduce((acc, d) => acc + d.amount, 0);
  const wonRevenueChangePct: number | null = wonPrevMonth > 0
    ? Math.round(((wonThisMonth - wonPrevMonth) / wonPrevMonth) * 100)
    : null;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const lastWeekStartStr = lastWeekStart.toISOString().slice(0, 10);
  const lastWeekEndStr = new Date(weekStart.getTime() - 86400000).toISOString().slice(0, 10);

  const thisWeekDeals = allDeals.filter((d) => !!d.expectedCloseDate && d.expectedCloseDate >= weekStartStr);
  const thisWeekClosed = thisWeekDeals.filter((d) => d.status === "CLOSED").length;
  const thisWeekRate = thisWeekDeals.length > 0 ? (thisWeekClosed / thisWeekDeals.length) * 100 : null;

  const lastWeekDeals = allDeals.filter((d) => !!d.expectedCloseDate && d.expectedCloseDate >= lastWeekStartStr && d.expectedCloseDate <= lastWeekEndStr);
  const lastWeekClosed = lastWeekDeals.filter((d) => d.status === "CLOSED").length;
  const lastWeekRate = lastWeekDeals.length > 0 ? (lastWeekClosed / lastWeekDeals.length) * 100 : null;

  const closeRateChangePct: number | null = thisWeekRate !== null && lastWeekRate !== null
    ? Math.round(thisWeekRate - lastWeekRate)
    : null;

  const availableCurrencies = Array.from(new Set(allDeals.map((d) => d.currency))) as DealCurrency[];

  const updateDeal = (dealId: string, updater: (deal: Deal) => Deal): void => {
    setBoardDeals((previous) => {
      const nextState: Record<DealStage, Deal[]> = {
        LEADS: previous.LEADS.map((deal) => (deal.id === dealId ? updater(deal) : deal)),
        QUALIFICATION: previous.QUALIFICATION.map((deal) => (deal.id === dealId ? updater(deal) : deal)),
        NEGOTIATION: previous.NEGOTIATION.map((deal) => (deal.id === dealId ? updater(deal) : deal)),
        CLOSED: previous.CLOSED.map((deal) => (deal.id === dealId ? updater(deal) : deal)),
      };

      return nextState;
    });
    setSelectedDeal((prev) => (prev?.id === dealId ? updater(prev) : prev));
  };

  const moveDealToStage = (dealId: string, targetStage: DealStage): void => {
    setBoardDeals((previous) => {
      let movedDeal: Deal | null = null;
      const withoutDeal: Record<DealStage, Deal[]> = {
        LEADS: previous.LEADS.filter((deal) => {
          if (deal.id === dealId) {
            movedDeal = deal;
            return false;
          }
          return true;
        }),
        QUALIFICATION: previous.QUALIFICATION.filter((deal) => {
          if (deal.id === dealId) {
            movedDeal = deal;
            return false;
          }
          return true;
        }),
        NEGOTIATION: previous.NEGOTIATION.filter((deal) => {
          if (deal.id === dealId) {
            movedDeal = deal;
            return false;
          }
          return true;
        }),
        CLOSED: previous.CLOSED.filter((deal) => {
          if (deal.id === dealId) {
            movedDeal = deal;
            return false;
          }
          return true;
        }),
      };

      if (!movedDeal) return previous;
      const dealToMove: Deal = movedDeal;

      const moved = {
        ...dealToMove,
        status: targetStage,
      };

      return {
        ...withoutDeal,
        [targetStage]: [...withoutDeal[targetStage], moved],
      };
    });
    updateDealMutation({ param: { dealId }, json: { status: targetStage } });
  };

  const deleteDeal = (dealId: string): void => {
    setBoardDeals((previous) => ({
      LEADS: previous.LEADS.filter((deal) => deal.id !== dealId),
      QUALIFICATION: previous.QUALIFICATION.filter((deal) => deal.id !== dealId),
      NEGOTIATION: previous.NEGOTIATION.filter((deal) => deal.id !== dealId),
      CLOSED: previous.CLOSED.filter((deal) => deal.id !== dealId),
    }));
    deleteDealMutation({ param: { dealId } });
  };

  const markDealOutcome = (dealId: string, outcome: DealOutcome): void => {
    updateDeal(dealId, (deal) => ({ ...deal, outcome }));
    updateDealMutation({ param: { dealId }, json: { outcome } });
  };

  const handleCreateDeal = (values: CreateDealFormValues): void => {
    const { assigneeIds, labelId, ...dealData } = values;
    createDealMutation(
      { json: { ...dealData, ...(labelId ? { labelId } : {}) } },
      {
        onSuccess: (response) => {
          if ("data" in response && response.data && "id" in response.data && assigneeIds.length > 0) {
            const dealId = response.data.id as string;
            const sellerIdToMemberId = Object.fromEntries(
              sellers.map((s) => [s.id, s.memberId])
            );
            for (const sellerId of assigneeIds) {
              const memberId = sellerIdToMemberId[sellerId];
              if (memberId) {
                addAssigneeMutation({ param: { dealId }, json: { memberId } });
              }
            }
          }
        },
      }
    );
  };

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;

    const sourceStage = result.source.droppableId as DealStage;
    const destinationStage = result.destination.droppableId as DealStage;
    const destinationIndex = result.destination.index;

    if (sourceStage === destinationStage && result.source.index === result.destination.index) return;

    setBoardDeals((previous) => {
      const sourceColumn = [...previous[sourceStage]];
      const [movedDeal] = sourceColumn.splice(result.source.index, 1);

      if (!movedDeal) return previous;

      const destinationColumn =
        sourceStage === destinationStage ? sourceColumn : [...previous[destinationStage]];

      destinationColumn.splice(destinationIndex, 0, {
        ...movedDeal,
        status: destinationStage,
      });

      return {
        ...previous,
        [sourceStage]: sourceColumn,
        [destinationStage]: destinationColumn,
      };
    });
    if (sourceStage !== destinationStage) {
      updateDealMutation({ param: { dealId: result.draggableId }, json: { status: destinationStage } });
    }
  };

  const getHealthIndicatorClassName = (score: number): string => {
    if (score < 50) return "bg-destructive";
    if (score < 75) return "bg-[hsl(var(--chart-4))]";
    return "bg-[hsl(var(--chart-2))]";
  };

  const getHealthTextClassName = (score: number): string => {
    if (score < 50) return "text-destructive";
    if (score < 75) return "text-[hsl(var(--chart-4))]";
    return "text-[hsl(var(--chart-2))]";
  };

  const getPriorityDotClassName = (priority: Deal["priority"]): string => {
    if (priority === 3) return "text-red-500";
    if (priority === 2) return "text-amber-500";
    return "text-blue-500";
  };

  const getPriorityBadgeClassName = (priority: Deal["priority"]): string => {
    if (priority === 3) return "border-destructive/30 bg-destructive/10 text-destructive";
    if (priority === 2) {
      return "border-[hsl(var(--chart-4)/0.35)] bg-[hsl(var(--chart-4)/0.12)] text-[hsl(var(--chart-4))]";
    }
    return "border-[hsl(var(--chart-1)/0.35)] bg-[hsl(var(--chart-1)/0.12)] text-[hsl(var(--chart-1))]";
  };

  const getOutcomeBadgeClassName = (outcome: DealOutcome): string => {
    if (outcome === "WON") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (outcome === "LOST") return "border-destructive/30 bg-destructive/10 text-destructive";
    return "border-muted-foreground/20 bg-muted/60 text-muted-foreground";
  };

  const getPriorityActiveFilterClassName = (priority: WorkItemPriority): string => {
    if (priority === 3) return "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 z-10";
    if (priority === 2) return "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 z-10";
    return "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 z-10";
  };

  const getOutcomeActiveFilterClassName = (outcome: DealOutcome): string => {
    if (outcome === "WON") return "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 z-10";
    if (outcome === "LOST") return "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 z-10";
    return "bg-accent text-accent-foreground border-foreground/25 z-10";
  };

  const toggleTableStageFilter = (stage: DealStage): void => {
    setTableStageFilter((prev) => {
      const next = prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage];
      return next.length === 0 ? [...STAGE_ORDER] : next;
    });
  };

  const toggleTablePriorityFilter = (p: WorkItemPriority): void => {
    setTablePriorityFilter((prev) => {
      const next = prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p];
      return next.length === 0 ? ([1, 2, 3] as WorkItemPriority[]) : next;
    });
  };

  const toggleTableOutcomeFilter = (o: DealOutcome): void => {
    setTableOutcomeFilter((prev) => {
      const next = prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o];
      return next.length === 0 ? (["PENDING", "WON", "LOST"] as DealOutcome[]) : next;
    });
  };

  const handleSort = (key: TableSortKey): void => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [tableQuery, sortKey, sortDirection, tableStageFilter, tablePriorityFilter, tableOutcomeFilter, activeHealthRange]);

  const metricCards = [
    {
      key: "monthly-goal",
      value: formatCurrency(monthlyGoal),
      helper: t("metrics.monthly-goal-helper", { pct: goalProgress }),
      progress: goalProgress,
      icon: Target,
      iconClassName: "text-primary",
      iconWrapperClassName: "bg-primary/10",
    },
    {
      key: "won-revenue",
      value: formatCurrency(wonAmount),
      helper: wonRevenueChangePct !== null
        ? t("metrics.won-revenue-helper", { pct: wonRevenueChangePct > 0 ? `+${wonRevenueChangePct}` : String(wonRevenueChangePct) })
        : t("metrics.won-revenue-no-prev"),
      progress: 0,
      icon: TrendingUp,
      iconClassName: "text-[hsl(var(--chart-2))]",
      iconWrapperClassName: "bg-[hsl(var(--chart-2)/0.15)]",
    },
    {
      key: "active-deals",
      value: String(allDeals.length),
      helper: t("metrics.active-deals-helper", {
        average: formatCurrency(allDeals.length > 0 ? Math.round(pipelineTotal / allDeals.length) : 0),
      }),
      progress: 0,
      icon: Clock3,
      iconClassName: "text-purple-600",
      iconWrapperClassName: "bg-purple-600/10",
    },
    {
      key: "close-rate",
      value: `${conversionRate}%`,
      helper: closeRateChangePct !== null
        ? t("metrics.close-rate-helper", { pct: closeRateChangePct > 0 ? `+${closeRateChangePct}` : String(closeRateChangePct) })
        : t("metrics.close-rate-no-prev"),
      progress: 0,
      icon: Trophy,
      iconClassName: "text-amber-600",
      iconWrapperClassName: "bg-amber-600/10",
    },
  ];

  const dateFromStr = dateFrom ? dateFrom.toISOString().slice(0, 10) : "";
  const dateToStr = dateTo ? dateTo.toISOString().slice(0, 10) : "";

  const applyBoardDealFilter = (deal: Deal, query: string): boolean => {
    if (selectedCurrency !== "all" && deal.currency !== selectedCurrency) return false;
    if (selectedAssignee !== "all" && !deal.assignees.includes(selectedAssignee)) return false;
    if (selectedSquadFilter !== "all" && !(selectedSquadDealIds ?? []).includes(deal.id)) return false;
    if (selectedLabelFilter !== "all" && deal.labelId !== selectedLabelFilter) return false;
    if (dateFromStr && (deal.expectedCloseDate ?? "") < dateFromStr) return false;
    if (dateToStr && (deal.expectedCloseDate ?? "9999") > dateToStr) return false;
    if (!query) return true;
    return deal.company.toLowerCase().includes(query) || deal.title.toLowerCase().includes(query);
  };

  const filteredBoardDeals: Record<DealStage, Deal[]> = {
    LEADS: boardDeals.LEADS.filter((deal) => applyBoardDealFilter(deal, pipelineQuery.trim().toLowerCase())),
    QUALIFICATION: boardDeals.QUALIFICATION.filter((deal) => applyBoardDealFilter(deal, pipelineQuery.trim().toLowerCase())),
    NEGOTIATION: boardDeals.NEGOTIATION.filter((deal) => applyBoardDealFilter(deal, pipelineQuery.trim().toLowerCase())),
    CLOSED: boardDeals.CLOSED.filter((deal) => applyBoardDealFilter(deal, pipelineQuery.trim().toLowerCase())),
  };

  const filteredTableDeals = allDeals.filter((deal) => {
    const query = tableQuery.trim().toLowerCase();
    if (selectedCurrency !== "all" && deal.currency !== selectedCurrency) return false;
    if (selectedAssignee !== "all" && !deal.assignees.includes(selectedAssignee)) return false;
    if (selectedSquadFilter !== "all" && !(selectedSquadDealIds ?? []).includes(deal.id)) return false;
    if (dateFromStr && (deal.expectedCloseDate ?? "") < dateFromStr) return false;
    if (dateToStr && (deal.expectedCloseDate ?? "9999") > dateToStr) return false;
    if (tableStageFilter.length < STAGE_ORDER.length && !tableStageFilter.includes(deal.status)) return false;
    if (tablePriorityFilter.length < 3 && !tablePriorityFilter.includes(deal.priority)) return false;
    if (tableOutcomeFilter.length < 3 && !tableOutcomeFilter.includes(deal.outcome)) return false;
    if (deal.healthScore < activeHealthRange[0] || deal.healthScore > activeHealthRange[1]) return false;
    if (!query) return true;
    return (
      deal.company.toLowerCase().includes(query) ||
      deal.title.toLowerCase().includes(query) ||
      deal.description.toLowerCase().includes(query)
    );
  });

  const sortedTableDeals = [...filteredTableDeals].sort((dealA, dealB) => {
    if (sortKey === "company") {
      const result = dealA.company.localeCompare(dealB.company);
      return sortDirection === "asc" ? result : result * -1;
    }

    if (sortKey === "priority") {
      const result = dealA.priority - dealB.priority;
      return sortDirection === "asc" ? result : result * -1;
    }

    if (sortKey === "health") {
      const result = dealA.healthScore - dealB.healthScore;
      return sortDirection === "asc" ? result : result * -1;
    }

    const result = dealA.amount - dealB.amount;
    return sortDirection === "asc" ? result : result * -1;
  });

  const totalPages = Math.max(1, Math.ceil(sortedTableDeals.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDeals = sortedTableDeals.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (isLoadingBoards) {
    return (
      <main className="mt-20 ml-14 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        {/* <p className="text-sm text-muted-foreground">{t("board.loading")}</p> */}
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const hasNoBoards = !isLoadingBoards && boards.length === 0;

  return (
    <>
    <main className={cn("mt-20 ml-14 px-4 pb-8 md:px-6", hasNoBoards && "pointer-events-none select-none blur-sm")}>
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <SalesBoardSwitcher
              boards={boards}
              selectedBoardId={selectedBoardId}
              onSelect={setSelectedBoardId}
              onCreateNew={() => {
                if (isAtBoardLimit) {
                  setUpgradeDialogOpen(true);
                  return;
                }
                setIsCreateBoardOpen(true);
              }}
            />
            {selectedBoard && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  title={t("board.settings-title")}
                  onClick={() => setIsBoardSettingsOpen(true)}
                >
                  <Settings2 className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  title={t("labels.dialog-title")}
                  onClick={() => setIsBoardLabelsOpen(true)}
                >
                  <Tag className="size-4" />
                </Button>
              </>
            )}
          </div>
          {/* <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p> */}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("search-placeholder")}
              value={pipelineQuery}
              onChange={(event) => setPipelineQuery(event.target.value)}
            />
          </div>
          <Button onClick={() => { setCreateDealStage("LEADS"); setIsCreateDealOpen(true); }}>
            <Plus className="mr-2 size-4" />
            {t("new-deal")}
          </Button>
        </div>
      </section>

      <section className={cn("mt-6 grid gap-4 md:grid-cols-2", (isFree || !isPro) ? "xl:grid-cols-3" : "xl:grid-cols-4")}>
        {metricCards.filter((metric) => isPro || metric.key !== 'monthly-goal').map((metric) => (
          <Card key={metric.key}>
            <CardHeader className="pb-3">
              <div className="mb-2 flex items-center justify-between">
                <span className={cn("rounded-md p-2", metric.iconWrapperClassName)}>
                  <metric.icon className={cn("size-4", metric.iconClassName)} />
                </span>
                {metric.key === "monthly-goal" && (
                  <div className="flex items-center gap-1">
                    {activeGoal && <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setIsSetGoalOpen(true)}
                      title={t("goal.set-goal")}
                    >
                      <Settings className="size-3.5" />
                    </Button>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setIsGoalHistoryOpen(true)}
                      title={t("goal.history-title")}
                    >
                      <History className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>{t(`metrics.${metric.key}`)}</CardDescription>
              {(metric.key !== "monthly-goal" || !!activeGoal) && (
                <CardTitle className="text-2xl">{metric.value}</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {metric.key === "monthly-goal" && !activeGoal ? (
                <>
                  <p className="text-sm text-muted-foreground">{t("metrics.no-goal")}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSetGoalOpen(true)}
                    className="mt-3 w-full gap-1.5 text-xs"
                  >
                    <Target className="size-3.5" />
                    {t("metrics.set-goal-cta")}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{metric.helper}</p>
                  {(metric.key === "monthly-goal" || metric.progress > 0) && (
                    <Progress className="mt-3" value={metric.progress} />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <Tabs defaultValue="pipeline" className="mt-6">
        {availableCurrencies.length > 1 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("currency.filter-label")}</span>
            <button
              type="button"
              onClick={() => setSelectedCurrency("all")}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                selectedCurrency === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:border-foreground/50"
              )}
            >
              {t("currency.all")}
            </button>
            {availableCurrencies.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCurrency(c)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium transition-colors",
                  selectedCurrency === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground hover:border-foreground/50"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{t("filters.date-from")}</span>
          <CustomDatePicker
            value={dateFrom}
            onChange={(date) => setDateFrom(date)}
            onClear={() => setDateFrom(undefined)}
            className="h-7 w-32 text-xs"
          />
          <span className="text-xs text-muted-foreground">{t("filters.date-to")}</span>
          <CustomDatePicker
            value={dateTo}
            onChange={(date) => setDateTo(date)}
            onClear={() => setDateTo(undefined)}
            className="h-7 w-32 text-xs"
          />
          <span className="text-xs text-muted-foreground">{t("filters.assignee-label")}</span>
          <button
            type="button"
            onClick={() => setSelectedAssignee("all")}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
              selectedAssignee === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:border-foreground/50"
            )}
          >
            {t("filters.all-assignees")}
          </button>
          {sellers.map((seller) => (
            <button
              key={seller.id}
              type="button"
              onClick={() => setSelectedAssignee(seller.id)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                selectedAssignee === seller.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-foreground/50"
              )}
            >
              {seller.initials}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-7 gap-1.5 text-xs"
            onClick={() => setIsManageSellersOpen(true)}
          >
            <Users className="size-3.5" />
            {t("sellers.title")}
          </Button>
          {sellers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setIsManageSellSquadsOpen(true)}
            >
              <CirclePile className="size-3.5" />
              {t("squads.manage-btn")}
            </Button>
          )}
        </div>
        {sellSquads.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("squads.filter-label")}</span>
            <button
              type="button"
              onClick={() => setSelectedSquadFilter("all")}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                selectedSquadFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-foreground/50"
              )}
            >
              {t("squads.filter-all")}
            </button>
            {sellSquads.map(squad => {
              const parsedMeta = (() => {
                try { return squad.metadata ? (JSON.parse(squad.metadata) as { color?: string | null }) : null; }
                catch { return null; }
              })();
              const squadColor = parsedMeta?.color ?? null;
              const isActive = selectedSquadFilter === squad.$id;
              return (
                <button
                  key={squad.$id}
                  type="button"
                  onClick={() => setSelectedSquadFilter(isActive ? "all" : squad.$id)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    isActive ? "border-transparent" : "border-border"
                  )}
                  style={
                    isActive && squadColor
                      ? { backgroundColor: squadColor, color: "#fff", borderColor: squadColor }
                      : isActive
                        ? undefined
                        : {}
                  }
                >
                  {squad.name}
                </button>
              );
            })}
          </div>
        )}
        {boardLabels.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Tag className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t("labels.filter-label")}</span>
            <button
              type="button"
              onClick={() => setSelectedLabelFilter("all")}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                selectedLabelFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-foreground/50"
              )}
            >
              {t("filters.all-assignees")}
            </button>
            {boardLabels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => setSelectedLabelFilter(selectedLabelFilter === label.id ? "all" : label.id)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                  selectedLabelFilter === label.id
                    ? "border-transparent"
                    : "border-border"
                )}
                style={
                  selectedLabelFilter === label.id
                    ? { backgroundColor: label.color, color: (LABEL_COLORS.find((c) => c.value === label.color)?.textColor ?? "#000") }
                    : {}
                }
              >
                {label.name}
              </button>
            ))}
          </div>
        )}
        <TabsList className={cn("grid w-full", (isFree || !isPro) ? "grid-cols-2 md:w-[360px]" : "grid-cols-3 md:w-[540px]")}>
          <TabsTrigger value="pipeline" className="gap-1.5 items-center">
            <KanbanSquare className="size-3.5" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="prospects" className="gap-1.5 items-center">
            <HeartHandshake className="size-3.5" />
            {t("tabs.prospects")}
          </TabsTrigger>
          {isPro && (
            <TabsTrigger value="charts" className="gap-1.5 items-center">
              <ChartLine className="size-3.5" />
              {t("tabs.charts")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {STAGE_ORDER.map((stage) => {
                const stageDeals = filteredBoardDeals[stage];
                const stageAmount = stageDeals.reduce((acc, deal) => acc + deal.amount, 0);

                return (
                  <Droppable key={stage} droppableId={stage} type="DEAL">
                    {(provided) => (
                      <Card className="flex-1 bg-muted">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm">{t(`stages.${stage}`)}</CardTitle>
                                <Badge variant="secondary">{stageDeals.length}</Badge>
                            </div>
                            <CardDescription className="text-xs">{formatCurrency(stageAmount)}</CardDescription>
                          </div>
                        </CardHeader>

                        <CardContent
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-2 pt-3 min-h-[200px] p-2"
                        >
                          {stageDeals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(dragProvided) => (
                                <article
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className="cursor-pointer rounded-md border bg-card p-3"
                                  onClick={() => setSelectedDeal(deal)}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium leading-tight">{deal.title}</p>
                                    <DropdownMenu modal={false}>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-7 shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="size-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-fit">
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger
                                            disabled={deal.status === "CLOSED" && deal.outcome !== "PENDING"}
                                            className={cn(deal.status === "CLOSED" && deal.outcome !== "PENDING" && "opacity-50 pointer-events-none")}
                                          >
                                            {t("menu.move-to")}
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent>
                                            {STAGE_ORDER.filter((target) => target !== deal.status).map((target) => (
                                              <DropdownMenuItem key={target} onClick={(e) => { e.stopPropagation(); moveDealToStage(deal.id, target); }} className="cursor-pointer">
                                                {t(`stages.${target}`)}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        {deal.outcome !== "WON" && (
                                          <DropdownMenuItem
                                            className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                                            onClick={(e) => { e.stopPropagation(); markDealOutcome(deal.id, "WON"); }}
                                          >
                                            <Trophy className="mr-2 size-4" />
                                            {t("menu.mark-won")}
                                          </DropdownMenuItem>
                                        )}
                                        {deal.outcome !== "LOST" && (
                                          <DropdownMenuItem
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); markDealOutcome(deal.id, "LOST"); }}
                                          >
                                            <XCircle className="mr-2 size-4" />
                                            {t("menu.mark-lost")}
                                          </DropdownMenuItem>
                                        )}
                                        {deal.outcome !== "PENDING" && (
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); markDealOutcome(deal.id, "PENDING"); }}
                                          >
                                            <Undo2 className="mr-2 size-4" />
                                            {t("menu.mark-pending")}
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive cursor-pointer"
                                          onClick={(e) => { e.stopPropagation(); deleteDeal(deal.id); }}
                                        >
                                          <Trash2 className="mr-2 size-4" />
                                          {t("menu.delete")}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <p className="text-xs text-muted-foreground">{deal.description}</p>

                                  {deal.nextStep && (
                                    <div className="mt-2 rounded-md border border-border/60 bg-muted/50 px-2 py-1.5">
                                      <span className="block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        {t("detail.next-step-short")}
                                      </span>
                                      <span className="block truncate text-[11px] font-medium text-foreground/90">{deal.nextStep}</span>
                                    </div>
                                  )}

                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <div className="ml-auto flex items-center gap-1">
                                      {deal.assignees.map((sellerId) => {
                                        const sel = sellers.find((s) => s.id === sellerId);
                                        return (
                                          <Avatar key={sellerId} className="size-5" title={sel?.name}>
                                            {sel?.avatarId && (
                                              <AvatarImage src={`/api/settings/get-image/${sel.avatarId}`} alt={sel?.name} />
                                            )}
                                            <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                                              {sel?.initials ?? "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                        );
                                      })}
                                      <span
                                        className={cn(
                                          "ml-1 inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                                          getPriorityBadgeClassName(deal.priority)
                                        )}
                                      >
                                        {t(`priorities.${deal.priority}`)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-sm font-medium">{formatCurrency(deal.amount, deal.currency)}</p>
                                      <span className="rounded border bg-muted px-1 py-0.5 font-mono text-[9px] text-muted-foreground">{deal.currency}</span>
                                    </div>
                                    {deal.expectedCloseDate && (
                                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <CalendarDays className="size-3" />
                                        {deal.expectedCloseDate.slice(0, 10)}
                                      </span>
                                    )}
                                  </div>

                                  {deal.needsAttention && (
                                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
                                      {t("attention-required")}
                                    </div>
                                  )}
                                  {deal.labelId && (() => {
                                    const lbl = boardLabels.find((l) => l.id === deal.labelId);
                                    if (!lbl) return null;
                                    const colorDef = LABEL_COLORS.find((c) => c.value === lbl.color);
                                    return (
                                      <div
                                        className="mt-2 rounded-md px-2 py-0.5 text-[11px] font-semibold w-fit"
                                        style={{ backgroundColor: lbl.color, color: colorDef?.textColor ?? "#000" }}
                                      >
                                        {lbl.name}
                                      </div>
                                    );
                                  })()}
                                  {deal.outcome !== "PENDING" && (
                                    <div className={cn(
                                      "mt-2 rounded-md border px-2 py-1 text-[11px] font-semibold",
                                      deal.outcome === "WON"
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "border-destructive/30 bg-destructive/10 text-destructive"
                                    )}>
                                      {t(`outcomes.${deal.outcome.toLowerCase()}`)}
                                    </div>
                                  )}
                                </article>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => { setCreateDealStage(stage); setIsCreateDealOpen(true); }}
                          >
                            {t("add-here")}
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="prospects" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="mb-4 flex w-full items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={tableQuery}
                    onChange={(event) => setTableQuery(event.target.value)}
                    placeholder={t("table.search-placeholder")}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Prospect filters */}
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Stage filter */}
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 text-xs text-muted-foreground">{t("table-filters.stage")}</span>
                  <div className="flex">
                    {STAGE_ORDER.map((stage, i) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => toggleTableStageFilter(stage)}
                        className={cn(
                          "border px-2.5 py-1 text-xs font-medium transition-colors",
                          i === 0 ? "rounded-l-md" : "",
                          i === STAGE_ORDER.length - 1 ? "rounded-r-md" : "border-r-0",
                          tableStageFilter.includes(stage)
                            ? "bg-accent text-accent-foreground border-foreground/25 z-10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {t(`stages.${stage}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority filter */}
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 text-xs text-muted-foreground">{t("table-filters.priority")}</span>
                  <div className="flex">
                    {([1, 2, 3] as WorkItemPriority[]).map((p, i) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleTablePriorityFilter(p)}
                        className={cn(
                          "flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors",
                          i === 0 ? "rounded-l-md" : "",
                          i === 2 ? "rounded-r-md" : "border-r-0",
                          tablePriorityFilter.includes(p)
                            ? getPriorityActiveFilterClassName(p)
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        <Circle
                          className={cn(
                            "size-2 fill-current",
                            tablePriorityFilter.includes(p) ? "text-current" : getPriorityDotClassName(p)
                          )}
                        />
                        {t(`priorities.${p}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outcome filter */}
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 text-xs text-muted-foreground">{t("table-filters.outcome")}</span>
                  <div className="flex">
                    {(["PENDING", "WON", "LOST"] as DealOutcome[]).map((o, i) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => toggleTableOutcomeFilter(o)}
                        className={cn(
                          "border px-2.5 py-1 text-xs font-medium transition-colors",
                          i === 0 ? "rounded-l-md" : "",
                          i === 2 ? "rounded-r-md" : "border-r-0",
                          tableOutcomeFilter.includes(o)
                            ? getOutcomeActiveFilterClassName(o)
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {t(`outcomes.${o.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Health Score slider */}
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs text-muted-foreground">{t("table-filters.health-label")}</span>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={pendingHealthRange}
                    onValueChange={(val) => setPendingHealthRange(val as [number, number])}
                    onValueCommit={(val) => setActiveHealthRange(val as [number, number])}
                    className="w-28"
                  />
                  <span className="w-16 text-xs tabular-nums text-muted-foreground">
                    {pendingHealthRange[0]}–{pendingHealthRange[1]}
                  </span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("company")}
                      >
                        {t("table.company-contact")}
                        <ArrowDownUp className="ml-2 size-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.close-date")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("priority")}
                      >
                        {t("table.priority")}
                        <ArrowDownUp className="ml-2 size-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("value")}
                      >
                        {t("table.value")}
                        <ArrowDownUp className="ml-2 size-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("health")}
                      >
                        {t("table.health")}
                        <ArrowDownUp className="ml-2 size-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("table.outcome")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDeals.map((deal) => (
                    <TableRow
                      key={deal.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold">{deal.company}</p>
                          <p className="text-sm text-muted-foreground">{deal.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t(`stages.${deal.status}`)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : <span className="italic text-muted-foreground/60">{t("table.no-close-date")}</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Circle className={cn("size-2.5 fill-current", getPriorityDotClassName(deal.priority))} />
                          <span>{t(`priorities.${deal.priority}`)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-1.5">
                          {formatCurrency(deal.amount, deal.currency)}
                          <span className="rounded border bg-muted px-1 py-0.5 font-mono text-[9px] text-muted-foreground">{deal.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {deal.outcome === "PENDING" ? (
                          <div className="flex items-center gap-3">
                            <Progress
                              className={cn("h-2 w-24")}
                              indicatorClassName={getHealthIndicatorClassName(deal.healthScore)}
                              value={deal.healthScore}
                            />
                            <span className={cn("text-sm font-medium", getHealthTextClassName(deal.healthScore))}>
                              {deal.healthScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold",
                            getOutcomeBadgeClassName(deal.outcome)
                          )}
                        >
                          {t(`outcomes.${deal.outcome.toLowerCase()}`)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={(e) => { e.stopPropagation(); setHealthDialogDeal(deal); }}
                        >
                          <Activity className="size-4" />
                        </Button>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-fit">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); }}
                            >
                              <Eye className="mr-2 size-4" />
                              {t("menu.open")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger
                                disabled={deal.status === "CLOSED" && deal.outcome !== "PENDING"}
                                className={cn(deal.status === "CLOSED" && deal.outcome !== "PENDING" && "opacity-50 pointer-events-none")}
                              >
                                {t("menu.move-to")}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {STAGE_ORDER.filter((target) => target !== deal.status).map((target) => (
                                  <DropdownMenuItem
                                    key={target}
                                    className="cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); moveDealToStage(deal.id, target); }}
                                  >
                                    {t(`stages.${target}`)}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            {deal.outcome !== "WON" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                                onClick={(e) => { e.stopPropagation(); markDealOutcome(deal.id, "WON"); }}
                              >
                                <Trophy className="mr-2 size-4" />
                                {t("menu.mark-won")}
                              </DropdownMenuItem>
                            )}
                            {deal.outcome !== "LOST" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={(e) => { e.stopPropagation(); markDealOutcome(deal.id, "LOST"); }}
                              >
                                <XCircle className="mr-2 size-4" />
                                {t("menu.mark-lost")}
                              </DropdownMenuItem>
                            )}
                            {deal.outcome !== "PENDING" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); markDealOutcome(deal.id, "PENDING"); }}
                              >
                                <Undo2 className="mr-2 size-4" />
                                {t("menu.mark-pending")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteDeal(deal.id); }}
                            >
                              <Trash2 className="mr-2 size-4" />
                              {t("menu.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedDeals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                        {t("table.no-results")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("table.records-current-page", {
                    count: paginatedDeals.length,
                    total: sortedTableDeals.length,
                  })}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">{t("table.page-of", { page: safePage, total: totalPages })}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                    disabled={safePage <= 1}
                  >
                    {t("table.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                    disabled={safePage >= totalPages}
                  >
                    {t("table.next")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {isPro && (
        <TabsContent value="charts">
          <SalesChartsTab
            deals={allDeals}
            sellers={sellers}
            goalHistory={goals}
            monthlyGoal={monthlyGoal}
            goalCurrency={goalCurrency}
            currentMonth={new Date().toLocaleString("default", { month: "short", year: "numeric" })}
            wonAmount={wonAmount}
          />
        </TabsContent>
        )}
      </Tabs>

      <CreateDealDialog
        open={isCreateDealOpen}
        onOpenChange={setIsCreateDealOpen}
        onCreateDeal={handleCreateDeal}
        availableCurrencies={Array.isArray(selectedBoard?.currencies) && selectedBoard.currencies.length > 0 ? selectedBoard.currencies : ["USD"]}
        sellers={sellers}
        initialStage={createDealStage}
        boardLabels={boardLabels}
        onCreateLabel={selectedBoard ? (label) => {
          const newLabel: BoardLabel = { id: `BLABEL_${Date.now()}`, ...label };
          const updatedLabels = [...boardLabels, newLabel];
          updateBoardMutation({ param: { boardId: selectedBoard.id }, json: { labels: JSON.stringify(updatedLabels) } });
        } : undefined}
      />

      <ManageSellersDialog
        open={isManageSellersOpen}
        onOpenChange={setIsManageSellersOpen}
        sellers={sellers}
        onAddSeller={({ userId, ...rest }) =>
          createSellerMutation({ json: { ...rest, avatarId: userId } })
        }
        onRemoveSeller={(id) => deleteSellerMutation({ param: { sellerId: id } })}
      />

      <ManageSellSquadsDialog
        open={isManageSellSquadsOpen}
        onOpenChange={setIsManageSellSquadsOpen}
      />

      <DealDetailModal
        deal={selectedDeal}
        open={selectedDeal !== null}
        onOpenChange={(open) => { if (!open) setSelectedDeal(null); }}
        onUpdateDeal={updateDeal}
        sellers={sellers}
        onMoveToStage={moveDealToStage}
        onMarkOutcome={markDealOutcome}
        onSaveNextStep={(dealId, nextStep) => {
          updateDealMutation({ param: { dealId }, json: { nextStep } });
        }}
        onAddActivity={(dealId, content, type) => {
          addActivityMutation({ param: { dealId }, json: { content, ...(type ? { type } : {}) } });
        }}
        boardLabels={boardLabels}
        onChangeLabel={(dealId, labelId) => {
          updateDeal(dealId, (d) => ({ ...d, labelId: labelId ?? null }));
          updateDealMutation({ param: { dealId }, json: { labelId: labelId ?? null } });
        }}
      />

      <DealHealthDialog
        deal={healthDialogDeal}
        open={healthDialogDeal !== null}
        onOpenChange={(open) => { if (!open) setHealthDialogDeal(null); }}
      />

      <SetGoalDialog
        open={isSetGoalOpen}
        onOpenChange={setIsSetGoalOpen}
        currentGoal={monthlyGoal}
        currentCurrency={goalCurrency}
        availableCurrencies={Array.isArray(selectedBoard?.currencies) && selectedBoard.currencies.length > 0
          ? selectedBoard.currencies
          : [goalCurrency]}
        onSetGoal={(value, currency) => {
          if (!selectedBoardId) return;
          mutateSetGoal({
            param: { boardId: selectedBoardId },
            json: { boardId: selectedBoardId, targetAmount: value, currency, period: new Date().toISOString() },
          });
        }}
      />

      <GoalHistoryDialog
        open={isGoalHistoryOpen}
        onOpenChange={setIsGoalHistoryOpen}
        history={goals}
      />

      <CreateSalesBoardDialog
        open={isCreateBoardOpen}
        onOpenChange={setIsCreateBoardOpen}
        onCreated={setSelectedBoardId}
      />

      {selectedBoard && (
        <BoardSettingsDialog
          open={isBoardSettingsOpen}
          onOpenChange={setIsBoardSettingsOpen}
          board={selectedBoard}
          sellerCount={sellers.length}
        />
      )}
      {selectedBoard && (
        <BoardLabelsDialog
          open={isBoardLabelsOpen}
          onOpenChange={setIsBoardLabelsOpen}
          board={selectedBoard}
        />
      )}
    </main>

    {hasNoBoards && <SalesBoardOnboarding onCreated={setSelectedBoardId} />}
    <UpgradeDialog
      open={upgradeDialogOpen}
      onOpenChange={setUpgradeDialogOpen}
      feature="pipelines"
      currentCount={boards.length}
      limitCount={1}
    />
    </>
  );
};

export default SalesPipelineView;