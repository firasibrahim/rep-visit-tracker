"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type TrendPoint = { label: string; count: number };
type StatusPoint = { name: string; value: number; color: string };

export default function DashboardCharts({
  visitsTrend,
  statusDistribution,
}: {
  visitsTrend: TrendPoint[];
  statusDistribution: StatusPoint[];
}) {
  const hasData = statusDistribution.some((s) => s.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-slate-700 text-sm mb-4">
          الزيارات خلال آخر 7 أيام
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={visitsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-slate-700 text-sm mb-4">حالة الزيارات</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
            لا توجد بيانات بعد
          </div>
        )}
      </div>
    </div>
  );
}
