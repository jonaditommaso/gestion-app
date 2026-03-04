"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GoalHistoryEntry } from "./GoalHistoryDialog";
import type { Deal, DealCurrency, DealStage, Seller } from "../types";

interface SalesChartsTabProps {
  deals: Deal[];
  sellers: Seller[];
  goalHistory: GoalHistoryEntry[];
  monthlyGoal: number;
  goalCurrency: DealCurrency;
  currentMonth: string;
  wonAmount: number;
}

const STAGE_ORDER: DealStage[] = ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"];

const SalesChartsTab = ({
  deals,
  sellers,
  goalHistory,
  monthlyGoal,
  currentMonth,
  wonAmount,
}: SalesChartsTabProps) => {
  const t = useTranslations("sales");

  const volumeByStageData = STAGE_ORDER.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.status === stage);
    const volume = stageDeals.reduce((acc, deal) => acc + deal.amount, 0);
    return {
      name: t(`stages.${stage}`),
      volume,
    };
  });

  const goalVsRealityData: { month: string; goal: number; achieved: number }[] = [
    ...goalHistory.map((entry) => ({
      month: (() => {
        try {
          return new Date(entry.period).toLocaleDateString(undefined, { month: "short", year: "numeric" });
        } catch {
          return entry.period;
        }
      })(),
      goal: entry.targetAmount,
      achieved: 0,
    })),
    {
      month: currentMonth,
      goal: monthlyGoal,
      achieved: wonAmount,
    },
  ];

  const dealsBySellerData = sellers.map((seller) => {
    const sellerDeals = deals.filter((deal) => deal.assignees.includes(seller.id));
    const active = sellerDeals.filter((deal) => deal.outcome === "PENDING").length;
    const won = sellerDeals.filter((deal) => deal.outcome === "WON").length;
    const lost = sellerDeals.filter((deal) => deal.outcome === "LOST").length;
    return {
      name: seller.initials,
      won,
      active,
      lost,
    };
  });

  const tooltipStyle = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--popover-foreground))",
    fontSize: "12px",
  };

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("charts.volume-by-stage")}</CardTitle>
          <CardDescription>{t("charts.volume-by-stage-desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumeByStageData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="volume" name={t("charts.volume")} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("charts.goal-vs-reality")}</CardTitle>
          <CardDescription>{t("charts.goal-vs-reality-desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={goalVsRealityData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="goal" name={t("charts.goal")} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="achieved" name={t("charts.achieved")} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {sellers.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("charts.deals-by-seller")}</CardTitle>
            <CardDescription>{t("charts.deals-by-seller-desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dealsBySellerData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="won" name={t("charts.won")} stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="active" name={t("charts.active")} stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lost" name={t("charts.lost")} stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesChartsTab;
