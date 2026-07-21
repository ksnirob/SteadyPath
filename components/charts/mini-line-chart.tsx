"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MiniLineChartProps = {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  color?: string;
};

export function MiniLineChart({ data, dataKey, color = "hsl(var(--primary))" }: MiniLineChartProps) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: -20, right: 8, top: 12, bottom: 0 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 8 }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
