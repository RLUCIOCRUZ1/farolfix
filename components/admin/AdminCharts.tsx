"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TimeseriesPoint } from "@/lib/types";

type AdminChartsProps = {
  title: string;
  data: TimeseriesPoint[];
};

export function AdminCharts({ title, data }: AdminChartsProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-black/40 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
            <Tooltip />
            <Legend />
            <Bar dataKey="acessos" fill="#0A84FF" />
            <Bar dataKey="agendamentos" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
