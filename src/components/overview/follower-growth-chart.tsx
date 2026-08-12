import { MetricLineChart } from "@/components/metric-line-chart";

export function FollowerGrowthChart({
  data,
}: {
  data: { date: string; followers: number }[];
}) {
  return (
    <MetricLineChart
      data={data.map((d) => ({ date: d.date, value: d.followers }))}
      dataKey="followers"
      label="Followers"
    />
  );
}
