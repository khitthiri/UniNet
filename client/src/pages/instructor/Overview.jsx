import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader, Panel } from "../../components/Page.jsx";
import StatCard from "../../components/StatCard.jsx";
import { StatusDonut } from "../../components/Charts.jsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { IcTasks, IcCheck, IcChart, IcClock, IcArrow, IcPlus } from "../../components/Icons.jsx";

function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }

export default function InstructorOverview() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/api/assignments").then((r) => setItems(r.data)).finally(() => setLoading(false)); }, []);

  const { stats, subData, gradeDonut, needsGrading } = useMemo(() => {
    const totalSubmitted = items.reduce((s, a) => s + (a.submittedCount || 0), 0);
    const totalGraded = items.reduce((s, a) => s + (a.gradedCount || 0), 0);
    return {
      stats: { assignments: items.length, submissions: totalSubmitted, graded: totalGraded, pending: Math.max(0, totalSubmitted - totalGraded) },
      subData: items.map((a) => ({ name: a.title.length > 10 ? a.title.slice(0, 9) + "…" : a.title, submitted: a.submittedCount || 0 })),
      gradeDonut: [
        { name: "Graded", value: totalGraded, color: "#0a84ff" },
        { name: "Awaiting grade", value: Math.max(0, totalSubmitted - totalGraded), color: "#ff9500" },
      ],
      needsGrading: items.filter((a) => (a.submittedCount || 0) > (a.gradedCount || 0)).slice(0, 4),
    };
  }, [items]);

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  const tooltipStyle = { borderRadius: 14, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", fontSize: 13, padding: "8px 12px", background: "var(--fallback-b1,oklch(var(--b1)))" };

  return (
    <div className="px-4 sm:px-8 py-7 max-w-6xl mx-auto">
      <PageHeader title={<>{greeting()}, {user.name.split(" ")[0]} 👋</>} subtitle={`${user.department || "Instructor"} · here's your teaching overview`}
        action={<Link to="/instructor/assignments" className="btn btn-primary px-5"><IcPlus width={18} height={18} /> New assignment</Link>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Assignments" value={stats.assignments} Icon={IcTasks} delay={0} />
        <StatCard label="Submissions" value={stats.submissions} Icon={IcCheck} iconBg="bg-[#34c759]/12" iconColor="text-[#34c759]" delay={0.05} />
        <StatCard label="Pending grading" value={stats.pending} tone={stats.pending ? "text-[#b36800]" : ""} Icon={IcClock} iconBg="bg-[#ff9500]/12" iconColor="text-[#ff9500]" delay={0.1} />
        <StatCard label="Graded" value={stats.graded} tone="text-primary" Icon={IcChart} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
          <Panel title="Submissions per assignment">
            {subData.length === 0 ? <div className="h-[200px] grid place-items-center text-[13px] opacity-40">No assignments yet</div> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={subData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,128,0.18)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,113,227,0.06)" }} />
                  <Bar dataKey="submitted" radius={[8, 8, 0, 0]} maxBarSize={44}>{subData.map((_, i) => <Cell key={i} fill="#0a84ff" />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <Panel title="Grading progress"><StatusDonut data={gradeDonut} /></Panel>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
        <Panel title="Needs grading" action={<Link to="/instructor/assignments" className="text-[13px] font-semibold text-primary hover:underline">All assignments</Link>}>
          {needsGrading.length === 0 ? <p className="text-[13px] opacity-40 py-6 text-center">You're all caught up. Nothing waiting to be graded.</p> : (
            <div className="space-y-2.5">
              {needsGrading.map((a) => (
                <Link key={a._id} to={`/instructor/assignments/${a._id}`} className="flex items-center gap-3 p-3 rounded-2xl bg-base-200 hover:bg-base-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-base-100 grid place-items-center shrink-0"><IcClock width={18} height={18} className="text-[#ff9500]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] truncate">{a.title}</p>
                    <p className="text-[12px] opacity-50">{a.course} · {(a.submittedCount || 0) - (a.gradedCount || 0)} awaiting grade</p>
                  </div>
                  <IcArrow width={16} height={16} className="opacity-30" />
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </motion.div>
    </div>
  );
}
