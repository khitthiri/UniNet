import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader, Panel } from "../../components/Page.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { GradeBarChart, StatusDonut } from "../../components/Charts.jsx";
import { IcTasks, IcClock, IcCheck, IcChart, IcArrow } from "../../components/Icons.jsx";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
const fmt = (d) => new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function StudentOverview() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/api/assignments").then((r) => setItems(r.data)).finally(() => setLoading(false)); }, []);

  const { stats, gradeData, statusData, upcoming, feedback } = useMemo(() => {
    const graded = items.filter((a) => a.submission?.grade != null);
    const avg = graded.length ? Math.round(graded.reduce((s, a) => s + (a.submission.grade / a.maxPoints) * 100, 0) / graded.length) : null;
    const todo = items.filter((a) => ["not_submitted", "overdue"].includes(a.status));
    const submitted = items.filter((a) => ["submitted", "late"].includes(a.status));
    return {
      stats: { total: items.length, todo: todo.length, submitted: submitted.length, avg },
      gradeData: graded.map((a) => ({ name: a.title.length > 10 ? a.title.slice(0, 9) + "…" : a.title, percent: Math.round((a.submission.grade / a.maxPoints) * 100) })),
      statusData: [
        { name: "To do", value: todo.length, color: "#8e8e93" },
        { name: "Submitted", value: items.filter((a) => a.status === "submitted").length, color: "#34c759" },
        { name: "Late", value: items.filter((a) => a.status === "late").length, color: "#ff9500" },
      ],
      upcoming: todo.filter((a) => new Date(a.dueDate) >= new Date()).sort((x, y) => new Date(x.dueDate) - new Date(y.dueDate)).slice(0, 4),
      feedback: graded.filter((a) => a.submission?.instructorNote).slice(0, 3),
    };
  }, [items]);

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-6xl mx-auto">
      <PageHeader title={<>{greeting()}, {user.name.split(" ")[0]} 👋</>} subtitle={`${user.academicYear} · here's your performance overview`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Assignments" value={stats.total} Icon={IcTasks} delay={0} />
        <StatCard label="Still to do" value={stats.todo} tone={stats.todo ? "text-[#b36800]" : "text-[#1d8a3c]"} Icon={IcClock} iconBg="bg-[#ff9500]/12" iconColor="text-[#ff9500]" delay={0.05} />
        <StatCard label="Submitted" value={stats.submitted} Icon={IcCheck} iconBg="bg-[#34c759]/12" iconColor="text-[#34c759]" delay={0.1} />
        <StatCard label="Average grade" value={stats.avg != null ? `${stats.avg}%` : "—"} tone="text-primary" Icon={IcChart} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
          <Panel title="Grade performance"><GradeBarChart data={gradeData} /></Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <Panel title="Submission status"><StatusDonut data={statusData} /></Panel>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
          <Panel title="Upcoming deadlines" action={<Link to="/student/assignments" className="text-[13px] font-semibold text-primary hover:underline">View all</Link>}>
            {upcoming.length === 0 ? <p className="text-[13px] opacity-40 py-6 text-center">You're all caught up. Nothing due.</p> : (
              <div className="space-y-2.5">
                {upcoming.map((a) => (
                  <Link key={a._id} to={`/student/assignments/${a._id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-base-200 hover:bg-base-300 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-base-100 grid place-items-center shrink-0">
                      <IcClock width={18} height={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] truncate">{a.title}</p>
                      <p className="text-[12px] opacity-50">{a.course} · Due {fmt(a.dueDate)}</p>
                    </div>
                    <IcArrow width={16} height={16} className="opacity-30" />
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2">
          <Panel title="Recent feedback">
            {feedback.length === 0 ? <p className="text-[13px] opacity-40 py-6 text-center">Instructor notes will appear here.</p> : (
              <div className="space-y-3">
                {feedback.map((a) => (
                  <Link key={a._id} to={`/student/assignments/${a._id}`} className="block p-3 rounded-2xl bg-base-200 hover:bg-base-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[13px] truncate">{a.title}</p>
                      <span className="text-[13px] font-bold text-primary shrink-0 ml-2">{a.submission.grade}/{a.maxPoints}</span>
                    </div>
                    <p className="text-[12px] opacity-55 mt-1 line-clamp-2">{a.submission.instructorNote}</p>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}
