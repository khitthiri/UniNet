import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { openAttachment, prettySize } from "../../api/files.js";
import { IcArrow, IcLink, IcFile, IcDownload } from "../../components/Icons.jsx";
import { modalBackdrop, modalCard } from "../../ui/motion.js";

export default function InstructorAssignmentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [active, setActive] = useState(null);
  const [grade, setGrade] = useState("");
  const [instructorNote, setInstructorNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get(`/api/submissions/assignment/${id}`).then((res) => { setData(res.data); setLoadError(""); });
  useEffect(() => { setData(null); setLoadError(""); load().catch((err) => setLoadError(err.response?.data?.message || "Could not load this assignment.")); }, [id]);

  if (loadError) return (
    <div className="px-4 sm:px-8 py-7 max-w-4xl mx-auto">
      <Link to="/instructor/assignments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:underline mb-4"><IcArrow width={16} height={16} className="rotate-180" /> Assignments</Link>
      <div className="surface p-8 text-center"><p className="font-semibold text-[16px]">Couldn't open this assignment</p><p className="text-[13px] opacity-50 mt-1">{loadError}</p>
        <button className="btn btn-primary btn-sm mt-4" onClick={() => load().catch((e) => setLoadError(e.response?.data?.message || "Still couldn't load it."))}>Try again</button></div>
    </div>
  );
  if (!data) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  const { assignment, roster } = data;
  const submitted = roster.filter((r) => ["submitted", "late"].includes(r.status)).length;
  const graded = roster.filter((r) => r.submission?.grade != null).length;

  const openGrading = (row) => { setActive(row); setGrade(row.submission?.grade ?? ""); setInstructorNote(row.submission?.instructorNote ?? ""); };
  const saveGrade = async () => {
    setBusy(true);
    try {
      await api.put(`/api/submissions/${id}/grade`, { studentId: active.student._id, grade: grade === "" ? null : Number(grade), instructorNote });
      setActive(null); await load();
    } catch (err) { alert(err.response?.data?.message || "Could not save the grade."); }
    finally { setBusy(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 sm:px-8 py-7 max-w-4xl mx-auto">
      <Link to="/instructor/assignments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:underline mb-4"><IcArrow width={16} height={16} className="rotate-180" /> Assignments</Link>

      <div className="surface p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-40">{assignment.type} · {assignment.course} · {assignment.assignedTo === "All" ? "All students" : `${assignment.assignedTo}s`}</p>
        <h1 className="text-[26px] sm:text-[30px] font-bold leading-tight mt-1">{assignment.title}</h1>
        <p className="text-[14px] opacity-50 mt-1.5">Due {new Date(assignment.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {assignment.maxPoints} pts</p>
        {assignment.description && <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed opacity-80">{assignment.description}</p>}
        {(assignment.resources || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {assignment.resources.map((r, i) => (
              r.kind === "file" ? (
                <button key={i} type="button" onClick={() => openAttachment(r)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-[12px] font-semibold hover:bg-primary/15 transition-colors">
                  <IcFile width={13} height={13} /> {r.label || r.name} <IcDownload width={12} height={12} className="opacity-70" />
                </button>
              ) : (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-[12px] font-semibold hover:bg-primary/15 transition-colors">
                  <IcLink width={13} height={13} /> {r.label || r.url}
                </a>
              )
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold bg-base-content/[0.06]">{roster.length} students</span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold bg-primary/10 text-primary">{submitted} submitted</span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold bg-[#34c759]/15 text-[#1d8a3c]">{graded} graded</span>
        </div>
      </div>

      <div className="mt-4 space-y-3 sm:hidden">
        {roster.map((row) => (
          <motion.button key={row.student._id} whileTap={{ scale: 0.985 }} onClick={() => openGrading(row)} className="surface w-full text-left flex items-center gap-3 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px] truncate">{row.student.name}</p>
              <p className="text-[12px] opacity-50">{row.student.academicYear}{row.student.uid ? ` · ${row.student.uid}` : ""}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5"><StatusBadge status={row.status} />
              <span className="text-[14px] font-bold text-primary">{row.submission?.grade != null ? `${row.submission.grade}/${assignment.maxPoints}` : "—"}</span></div>
          </motion.button>
        ))}
      </div>

      <div className="hidden sm:block surface mt-4 overflow-hidden">
        <table className="table">
          <thead><tr className="border-base-content/5 text-[12px] uppercase tracking-wide opacity-50"><th>Student</th><th>Year</th><th>Status</th><th>Submitted</th><th>Grade</th><th></th></tr></thead>
          <tbody>
            {roster.map((row) => (
              <tr key={row.student._id} className="border-base-content/5 hover:bg-base-200/60 transition-colors">
                <td><p className="font-semibold text-[14px]">{row.student.name}</p><p className="text-[12px] opacity-50">{row.student.email}</p></td>
                <td className="text-[13px]">{row.student.academicYear}</td>
                <td><StatusBadge status={row.status} /></td>
                <td className="text-[13px] opacity-70">{row.submission?.submittedAt ? new Date(row.submission.submittedAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                <td className="font-bold text-primary text-[14px]">{row.submission?.grade != null ? `${row.submission.grade}/${assignment.maxPoints}` : "—"}</td>
                <td><motion.button whileTap={{ scale: 0.95 }} className="btn btn-sm btn-primary btn-outline border-primary/30 px-4" onClick={() => openGrading(row)}>{row.submission?.grade != null ? "Edit" : "Grade"}</motion.button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div variants={modalBackdrop} initial="hidden" animate="show" exit="exit" className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/30"
            style={{ backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setActive(null)}>
            <motion.div variants={modalCard} className="bg-base-100 w-full sm:max-w-lg rounded-t-[1.5rem] sm:rounded-apple shadow-modal p-6 sm:p-7 max-h-[88vh] overflow-y-auto">
              <div className="w-10 h-1 rounded-full bg-base-content/15 mx-auto mb-4 sm:hidden" />
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="font-bold text-[20px]">{active.student.name}</h3><p className="text-[13px] opacity-50 mt-0.5">{active.student.academicYear}</p></div>
                <StatusBadge status={active.status} />
              </div>
              {active.submission?.content ? (
                <div className="mt-4"><p className="text-[12px] font-semibold uppercase tracking-wide opacity-40">Submitted work</p>
                  <div className="bg-base-200 rounded-2xl p-4 mt-1.5 text-[14px] whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">{active.submission.content}</div></div>
              ) : (active.submission?.attachments || []).length === 0 ? <div className="bg-base-200 rounded-2xl p-4 mt-4 text-[13px] opacity-70">No work submitted yet. You can still leave a note or record a grade.</div> : null}
              {(active.submission?.attachments || []).length > 0 && (
                <div className="mt-4">
                  <p className="text-[12px] font-semibold uppercase tracking-wide opacity-40">Attachments</p>
                  <div className="space-y-2 mt-1.5">
                    {active.submission.attachments.map((a, i) => (
                      <button key={i} onClick={() => openAttachment(a)}
                        className="w-full flex items-center gap-3 rounded-2xl bg-base-200 px-3.5 py-2.5 text-left hover:bg-base-300 transition-colors">
                        {a.kind === "file" ? <IcFile width={18} height={18} className="text-primary shrink-0" /> : <IcLink width={18} height={18} className="text-primary shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium truncate">{a.kind === "file" ? a.name : (a.label || a.url)}</p>
                          <p className="text-[12px] opacity-45 truncate">{a.kind === "file" ? prettySize(a.size) : a.url}</p>
                        </div>
                        {a.kind === "file" ? <IcDownload width={16} height={16} className="opacity-50 shrink-0" /> : <IcArrow width={16} height={16} className="opacity-50 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {active.submission?.studentNote && (
                <div className="mt-4"><p className="text-[12px] font-semibold uppercase tracking-wide opacity-40">Student's note</p>
                  <p className="text-[14px] mt-1.5 whitespace-pre-wrap bg-base-200 rounded-2xl p-4 leading-relaxed">{active.submission.studentNote}</p></div>
              )}
              <div className="mt-5"><p className="text-[13px] font-semibold mb-1.5">Grade (out of {assignment.maxPoints})</p>
                <input type="number" min="0" max={assignment.maxPoints} className="input w-full text-[17px] font-semibold" value={grade} onChange={(e) => setGrade(e.target.value)} /></div>
              <div className="mt-4"><p className="text-[13px] font-semibold mb-1.5">Your note to the student</p>
                <textarea className="textarea w-full min-h-24 text-[14px]" value={instructorNote} onChange={(e) => setInstructorNote(e.target.value)} placeholder="Feedback that supports the grade — what was strong, what to improve." /></div>
              <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={() => setActive(null)}>Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary px-6" onClick={saveGrade} disabled={busy}>{busy ? <span className="loading loading-spinner loading-sm" /> : "Save grade & note"}</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
