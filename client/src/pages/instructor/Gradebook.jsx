import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/client.js";
import { PageHeader, Panel } from "../../components/Page.jsx";
import StatCard from "../../components/StatCard.jsx";
import { IcArrow, IcChart } from "../../components/Icons.jsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const tooltipStyle = { borderRadius: 14, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", fontSize: 13, padding: "8px 12px", background: "var(--fallback-b1,oklch(var(--b1)))" };
const tone = (p) => (p >= 70 ? "#0a84ff" : p >= 50 ? "#ff9500" : "#ff3b30");

export default function InstructorGradebook() {
  const [items, setItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/assignments").then((r) => setItems(r.data)),
      api.get("/api/submissions/instructor/analytics").then((r) => setAnalytics(r.data)).catch(() => setAnalytics(null)),
    ]).finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => items.map((a) => ({ ...a, pending: Math.max(0, (a.submittedCount || 0) - (a.gradedCount || 0)) })), [items]);
  const courseChart = (analytics?.byCourse || []).map((c) => ({ name: c.course.length > 12 ? c.course.slice(0, 11) + "…" : c.course, percent: c.avgPercent ?? 0 }));

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-5xl mx-auto">
      <PageHeader title="Gradebook" subtitle="Grade-rate analysis and submission status across your classes" />

      {/* Grade-rate analysis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Class average" value={analytics?.overall.avgPercent != null ? `${analytics.overall.avgPercent}%` : "—"} tone="text-primary" Icon={IcChart} delay={0} />
        <StatCard label="Courses" value={analytics?.overall.courseCount ?? 0} delay={0.05} />
        <StatCard label="Graded items" value={analytics?.overall.gradedCount ?? 0} delay={0.1} />
        <StatCard label="Assignments" value={items.length} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
          <Panel title="Average grade by course">
            {courseChart.length === 0 ? <div className="h-[200px] grid place-items-center text-[13px] opacity-40">No graded work yet</div> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={courseChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,128,0.18)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,113,227,0.06)" }} formatter={(v) => [`${v}%`, "Avg"]} />
                  <Bar dataKey="percent" radius={[8, 8, 0, 0]} maxBarSize={48}>{courseChart.map((d, i) => <Cell key={i} fill={tone(d.percent)} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <Panel title="Per-course breakdown">
            {(analytics?.byCourse || []).length === 0 ? <p className="text-[13px] opacity-40 py-6 text-center">No grades yet.</p> : (
              <div className="space-y-2.5">
                {analytics.byCourse.map((c) => (
                  <div key={c.course} className="rounded-2xl bg-base-200 p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[14px] truncate">{c.course}</p>
                      <span className="text-[16px] font-bold" style={{ color: tone(c.avgPercent ?? 0) }}>{c.avgPercent != null ? `${c.avgPercent}%` : "—"}</span>
                    </div>
                    <p className="text-[12px] opacity-50 mt-0.5">{c.assignmentCount} assignment{c.assignmentCount === 1 ? "" : "s"} · {c.gradedCount} graded</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </motion.div>
      </div>

      {/* Submission/grading status */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
        <Panel title="Submission status">
          {rows.length === 0 ? <p className="text-[13px] opacity-40 py-10 text-center">No assignments yet.</p> : (
            <>
              <div className="hidden sm:block overflow-x-auto -m-2 p-2">
                <table className="table">
                  <thead><tr className="border-base-content/5 text-[12px] uppercase tracking-wide opacity-50"><th>Assignment</th><th>Type</th><th>Due</th><th>Submitted</th><th>Graded</th><th>Pending</th><th></th></tr></thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr key={a._id} className="border-base-content/5 hover:bg-base-200/60 transition-colors">
                        <td><p className="font-semibold text-[14px]">{a.title}</p><p className="text-[12px] opacity-50">{a.course} · {a.assignedTo === "All" ? "All students" : `${a.assignedTo}s`}</p></td>
                        <td className="text-[13px] capitalize">{a.type}</td>
                        <td className="text-[13px] opacity-70">{new Date(a.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</td>
                        <td className="text-[14px] font-semibold">{a.submittedCount}</td>
                        <td className="text-[14px] font-semibold text-primary">{a.gradedCount}</td>
                        <td>{a.pending > 0 ? <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-[#ff9500]/15 text-[#b36800]">{a.pending}</span> : <span className="text-[13px] opacity-40">—</span>}</td>
                        <td><Link to={`/instructor/assignments/${a._id}`} className="btn btn-sm btn-primary btn-outline border-primary/30 px-4">Open</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden space-y-3">
                {rows.map((a) => (
                  <Link key={a._id} to={`/instructor/assignments/${a._id}`} className="flex items-center gap-3 p-3.5 rounded-2xl bg-base-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] truncate">{a.title}</p>
                      <p className="text-[12px] opacity-50">{a.submittedCount} submitted · {a.gradedCount} graded{a.pending ? ` · ${a.pending} pending` : ""}</p>
                    </div>
                    <IcArrow width={16} height={16} className="opacity-30" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </Panel>
      </motion.div>
    </div>
  );
}
