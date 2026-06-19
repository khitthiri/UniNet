import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from "recharts";

const tooltipStyle = {
  borderRadius: 14, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  fontSize: 13, padding: "8px 12px", background: "var(--fallback-b1,oklch(var(--b1)))",
};

export function GradeBarChart({ data }) {
  if (!data.length) return <Empty text="No graded work yet" />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,128,0.18)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} interval={0} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,113,227,0.06)" }} formatter={(v) => [`${v}%`, "Score"]} />
        <Bar dataKey="percent" radius={[8, 8, 0, 0]} maxBarSize={44}>
          {data.map((d, i) => <Cell key={i} fill={d.percent >= 70 ? "#0a84ff" : d.percent >= 50 ? "#ff9500" : "#ff3b30"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <Empty text="Nothing to show yet" />;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <ResponsiveContainer width={170} height={170}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1 min-w-[140px]">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="text-[13px] font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="h-[200px] grid place-items-center text-[13px] opacity-40">{text}</div>;
}
