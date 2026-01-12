import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  labels: string[];
  applications: number[];
  views: number[];
}

interface AnalyticsChartProps {
  data: AnalyticsData;
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  
  const chartData = useMemo(() => {
    const safeLength = Math.min(
      data.labels.length,
      data.applications.length,
      data.views.length
    );

    return Array.from({ length: safeLength }, (_, i) => ({
      label: data.labels[i] || "—",
      applications: Number(data.applications[i] ?? 0),
      views: Number(data.views[i] ?? 0),
    }));
  }, [data]);

  
  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/30">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          stroke="hsl(var(--muted-foreground))"
        />
        
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="hsl(var(--muted-foreground))"
          label={{
            value: "Count",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
          }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number, name: string) => [
            value,
            name === "applications" ? "Applications Received" : "Job Views",
          ]}
        />

        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="line"
        />

        {/* ← PROFESSIONAL COLORS: Theme-aware + high contrast */}
        <Line
          type="monotone"
          dataKey="applications"
          stroke="hsl(var(--chart-1))" 
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
          activeDot={{ r: 6 }}
          name="Applications"
        />

        <Line
          type="monotone"
          dataKey="views"
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
          activeDot={{ r: 6 }}
          name="Views"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}