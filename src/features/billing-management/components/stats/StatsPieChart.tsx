"use client"

import { Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface StatsPieChartProps {
  categoriesData: {
    category: string,
    import: number,
    fill: string
  }[],
  type: 'incomes' | 'expenses'
}

export function StatsPieChart({ categoriesData, type }: StatsPieChartProps) {
  return (
    <ChartContainer
      config={{
        value: {
          label: type,
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[280px] w-full"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
        <Pie
          data={categoriesData}
          dataKey="import"
          nameKey="category"
          strokeWidth={1}
          stroke="hsl(var(--background))"
          innerRadius={62}
          outerRadius={105}
          paddingAngle={2}
          isAnimationActive
        />
      </PieChart>
    </ChartContainer>
  )
}
