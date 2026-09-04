"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactNumber } from "@/lib/format";

export function MetricLineChart({
  data,
  dataKey,
  label,
  height = 220,
  percent = false,
}: {
  data: { date: string; value: number }[];
  dataKey: string;
  label: string;
  height?: number;
  // Set for series stored as a raw fraction (e.g. engagement rate, 0.124
  // meaning 12.4%) — scales values into percentage points and formats the
  // axis with a "%" suffix, instead of showing the bare 0–0.2-ish fraction.
  percent?: boolean;
}) {
  const chartConfig = {
    [dataKey]: { label, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  // Multi-year history means "Jul 12" alone is ambiguous — same month/day
  // recurring across different years looks like it jumps backward on the
  // axis. Only add the year suffix when the data actually spans more than
  // one, so a single-year chart stays uncluttered.
  const years = new Set(data.map((d) => new Date(d.date).getFullYear()));
  const spansMultipleYears = years.size > 1;

  const points = data.map((d) => ({
    [dataKey]: percent ? d.value * 100 : d.value,
    label: new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: spansMultipleYears ? "2-digit" : undefined,
    }),
  }));

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <LineChart data={points} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
          tickFormatter={(value) => (percent ? `${formatCompactNumber(value)}%` : formatCompactNumber(value))}
        />
        <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent />} />
        <Line
          dataKey={dataKey}
          type="monotone"
          stroke={`var(--color-${dataKey})`}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
        />
      </LineChart>
    </ChartContainer>
  );
}
