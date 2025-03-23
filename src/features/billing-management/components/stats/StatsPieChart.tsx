"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import capitalize from "@/utils/capitalize"

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
    <Card className="flex flex-col p-0">
      <CardHeader className="items-center pb-0">
        <CardTitle>{capitalize(type)}</CardTitle>
        {/* <CardDescription>Add description, maybe the range selected in future</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square min-h-[400px] max-h-[450px] pb-0 [&_.recharts-pie-label-text]:fill-foreground p-0 w-[600px]"

        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
                data={categoriesData}
                dataKey="import"
                nameKey="category"
                strokeWidth={1}
                stroke="#ffffff"
                label={({ cx, cy, midAngle, outerRadius, percent, index }) => {
                  const radius = outerRadius + 30;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="black"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                    >
                      {categoriesData[index].category}
                      <tspan
                        x={x}
                        y={y + 15}
                        fill="gray"
                        fontWeight="semibold"
                      >
                        {`${(percent * 100).toFixed(1)}%`}
                      </tspan>
                    </text>
                  );
                }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
