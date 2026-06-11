import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/client.js";
import { PageHeader, Panel } from "../../components/Page.jsx";
import StatCard from "../../components/StatCard.jsx";
import StarRating from "../../components/StarRating.jsx";
import { IcMessage, IcStar, IcUser } from "../../components/Icons.jsx";

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function InstructorFeedback() {
  const [data, setData] = useState({ list: [], summary: { count: 0, avgRating: null, ratedCount: 0 } });
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/api/feedback").then((r) => setData(r.data)).finally(() => setLoading(false)); }, []);

  const byCourse = useMemo(() => {
    const m = {};
    for (const f of data.list) (m[f.course || "General"] ||= []).push(f);
    return Object.entries(m).map(([course, arr]) => ({ course, count: arr.length }));
  }, [data.list]);

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-4xl mx-auto">
      <PageHeader title="Feedback" subtitle="What your students say about your teaching" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        <StatCard label="Total feedback" value={data.summary.count} Icon={IcMessage} delay={0} />
        <StatCard label="Average rating" value={data.summary.avgRating != null ? `${data.summary.avgRating}★` : "—"} tone="text-[#b8860b]" Icon={IcStar} iconBg="bg-[#ff9f0a]/12" iconColor="text-[#ff9f0a]" delay={0.05} />
        <StatCard label="With a rating" value={data.summary.ratedCount} Icon={IcUser} delay={0.1} />
      </div>

      {byCourse.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
          <Panel title="By course">
            <div className="flex flex-wrap gap-2">
              {byCourse.map((c) => (
                <span key={c.course} className="inline-flex items-center gap-2 rounded-full bg-base-200 px-3.5 py-1.5 text-[13px] font-medium">
                  {c.course} <span className="opacity-50">{c.count}</span>
                </span>
              ))}
            </div>
          </Panel>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4">
        <Panel title="All feedback">
          {data.list.length === 0 ? (
            <div className="py-12 text-center"><IcMessage width={32} height={32} className="mx-auto opacity-20" /><p className="text-[14px] font-semibold mt-2">No feedback yet</p>
              <p className="text-[13px] opacity-50 mt-1">When students share feedback about your teaching, it'll appear here.</p></div>
          ) : (
            <div className="space-y-3">
              {data.list.map((f) => (
                <div key={f._id} className="rounded-2xl bg-base-200 p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-[14px]">{f.from?.name} <span className="opacity-40 font-normal">· {f.from?.academicYear}</span></p>
                      <p className="text-[12px] opacity-50">{f.course || "General teaching"} · {fmt(f.createdAt)}</p>
                    </div>
                    {f.rating && <StarRating value={f.rating} readOnly size={16} />}
                  </div>
                  <p className="text-[14px] mt-2 leading-relaxed whitespace-pre-wrap">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </motion.div>
    </div>
  );
}
