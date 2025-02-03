"use client";
import { Bar, BarChart, LabelList, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactNumber } from "@/util/numberFormatter";

interface ChartProps {
  disposals: { count: number; material: string }[];
}

export default function BinDisposalChart({ disposals }: ChartProps) {
  const chartConfig = {
    count: {
      label: "Disposal",
      color: "#22c55e",
    },
  } satisfies ChartConfig;
  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      <h3 className="text-center font-semibold text-[#4B5563]">
        🌱 See the Impact of Your Contribution! 🌍
      </h3>
      <ChartContainer
        config={chartConfig}
        className="min-h-[200px] max-h-[200px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={disposals}
          margin={{
            top: 25,
          }}
        >
          <XAxis
            className="font-bold"
            dataKey="material"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={8}>
            <LabelList
              position="top"
              offset={12}
              className="font-semibold"
              fontSize={12}
              fill="#1e293b"
              formatter={(value: number) => formatCompactNumber(value)}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
