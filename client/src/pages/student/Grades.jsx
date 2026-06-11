import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/client.js";
import { PageHeader, Panel } from "../../components/Page.jsx";
import { GradeBarChart } from "../../components/Charts.jsx";

export default function StudentGrades() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/api/assignments").then((r) => setItems(r.data)).finally(() => setLoading(false)); }, []);

  const { graded, avg, gradeData, byCourse } = useMemo(() => {
    const g = items.filter((a) => a.submission?.grade != null);
    const a = g.length ? Math.round(g.reduce((s, x) => s + (x.submission.grade / x.maxPoints) * 100, 0) / g.length) : null;
    const courses = {};
    g.forEach((x) => {
      const pct = (x.submission.grade / x.maxPoints) * 100;
      (courses[x.course] ||= []).push(pct);
    });
    return {
      graded: g, avg: a,
      gradeData: g.map((x) => ({ name: x.title.length > 10 ? x.title.slice(0, 9) + "…" : x.title, percent: Math.round((x.submission.grade / x.maxPoints) * 100) })),
      byCourse: Object.entries(courses).map(([c, arr]) => ({ course: c, avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length), count: arr.length })),
    };
  }, [items]);

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-5xl mx-auto">
      <PageHeader title="Grades" subtitle="Your graded assignments and exams" />

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="surface p-6 flex flex-col justify-center">
          <p className="text-[12px] font-semibold uppercase tracking-wide opacity-40">Overall average</p>
          <p className="text-[52px] font-bold text-primary leading-none mt-2">{avg != null ? `${avg}%` : "—"}</p>
          <p className="text-[13px] opacity-50 mt-2">Across {graded.length} graded item{graded.length === 1 ? "" : "s"}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-2">
          <Panel title="Performance by assignment"><GradeBarChart data={gradeData} /></Panel>
        </motion.div>
      </div>

      {byCourse.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
          <Panel title="By course">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {byCourse.map((c) => (
                <div key={c.course} className="rounded-2xl bg-base-200 p-4">
                  <p className="font-semibold text-[14px]">{c.course}</p>
                  <p className="text-[28px] font-bold text-primary leading-tight mt-1">{c.avg}%</p>
                  <p className="text-[12px] opacity-50">{c.count} graded</p>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
        <Panel title="All grades">
          {graded.length === 0 ? <p className="text-[13px] opacity-40 py-8 text-center">No grades yet. They'll show up here once your instructor grades your work.</p> : (
            <div className="space-y-2.5">
              {graded.map((a) => {
                const pct = Math.round((a.submission.grade / a.maxPoints) * 100);
                return (
                  <Link key={a._id} to={`/student/assignments/${a._id}`} className="flex items-center gap-4 p-3.5 rounded-2xl bg-base-200 hover:bg-base-300 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] truncate">{a.title}</p>
                      <p className="text-[12px] opacity-50">{a.course} · {a.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[16px] font-bold text-primary">{a.submission.grade}/{a.maxPoints}</p>
                      <p className={`text-[12px] font-semibold ${pct >= 70 ? "text-[#1d8a3c]" : pct >= 50 ? "text-[#b36800]" : "text-[#d70015]"}`}>{pct}%</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
      </motion.div>
    </div>
  );
}
