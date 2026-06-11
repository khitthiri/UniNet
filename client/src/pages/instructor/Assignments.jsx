import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client.js";
import { PageHeader } from "../../components/Page.jsx";
import { uploadFile, openAttachment, prettySize } from "../../api/files.js";
import { IcPlus, IcArrow, IcLink, IcFile, IcDownload, IcTrash } from "../../components/Icons.jsx";
import { modalBackdrop, modalCard } from "../../ui/motion.js";

const YEARS = ["All", "Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const EMPTY = { title: "", description: "", type: "assignment", course: "", dueDate: "", maxPoints: 100, assignedTo: "All", resources: [] };

export default function InstructorAssignments() {
  const [items, setItems] = useState([]);
  const fileInput = useRef(null);
  const [linkDraft, setLinkDraft] = useState({ label: "", url: "" });
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/api/assignments").then((r) => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const addResourceLink = () => {
    if (!linkDraft.url.trim()) return;
    setForm((f) => ({ ...f, resources: [...f.resources, { kind: "link", label: linkDraft.label.trim(), url: linkDraft.url.trim() }] }));
    setLinkDraft({ label: "", url: "" });
  };
  const onPickFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    setUploading(true); setError("");
    try {
      for (const f of files) {
        const ref = await uploadFile(f);
        setForm((prev) => ({ ...prev, resources: [...prev.resources, ref] }));
      }
    } catch (err) { setError(err.response?.data?.message || err.message || "Upload failed."); }
    finally { setUploading(false); }
  };
  const removeResource = (i) => setForm((f) => ({ ...f, resources: f.resources.filter((_, idx) => idx !== i) }));

  const create = async () => {
    setError("");
    if (!form.title || !form.course || !form.dueDate) return setError("Title, course, and due date are required.");
    setBusy(true);
    try { await api.post("/api/assignments", { ...form, maxPoints: Number(form.maxPoints) }); setForm(EMPTY); setOpen(false); await load(); }
    catch (err) { setError(err.response?.data?.message || "Could not create the assignment."); }
    finally { setBusy(false); }
  };
  const remove = async (id) => { if (!confirm("Delete this assignment and all of its submissions?")) return; await api.delete(`/api/assignments/${id}`); await load(); };

  if (loading) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-5xl mx-auto">
      <PageHeader title="Assignments" subtitle="Create and manage your tasks and exams"
        action={<motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary px-5" onClick={() => setOpen(true)}><IcPlus width={18} height={18} /> New assignment</motion.button>} />

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 && (
            <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="surface py-14 text-center">
              <p className="font-semibold text-[15px]">No assignments yet</p>
              <p className="text-[13px] opacity-50 mt-1">Create your first assignment and it will appear on your students' dashboards.</p>
            </motion.div>
          )}
          {items.map((a) => (
            <motion.div key={a._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} whileHover={{ y: -3 }}
              className="surface flex items-center gap-4 px-5 py-4">
              <Link to={`/instructor/assignments/${a._id}`} className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-40">{a.type} · {a.course} · {a.assignedTo === "All" ? "All students" : `${a.assignedTo}s`}</p>
                <p className="font-semibold text-[16px] mt-0.5 truncate">{a.title}</p>
                <p className="text-[13px] opacity-50 mt-0.5">
                  Due {new Date(a.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {a.submittedCount} submitted · {a.gradedCount} graded
                </p>
              </Link>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <Link to={`/instructor/assignments/${a._id}`} className="btn btn-sm btn-primary btn-outline border-primary/30 px-4">Review</Link>
                <button className="btn btn-sm btn-ghost text-[#d70015]" onClick={() => remove(a._id)}>Delete</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {open && (
          <motion.div variants={modalBackdrop} initial="hidden" animate="show" exit="exit"
            className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/30 p-0 sm:p-4"
            style={{ backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <motion.div variants={modalCard} className="bg-base-100 w-full sm:max-w-lg rounded-t-[1.5rem] sm:rounded-apple shadow-modal p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
              <div className="w-10 h-1 rounded-full bg-base-content/15 mx-auto mb-4 sm:hidden" />
              <h2 className="font-bold text-[20px]">New assignment</h2>
              {error && <div className="text-[13px] font-medium text-[#d70015] bg-[#ff3b30]/10 rounded-xl px-3 py-2 mt-3">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <input className="input w-full sm:col-span-2" value={form.title} onChange={set("title")} placeholder="Title — e.g. Midterm exam: data structures" />
                <input className="input w-full" value={form.course} onChange={set("course")} placeholder="Course — e.g. CS 301" />
                <select className="select w-full" value={form.type} onChange={set("type")}>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                </select>
                <div><p className="text-[12px] font-semibold opacity-50 mb-1 ml-1">Due date</p>
                  <input type="datetime-local" className="input w-full" value={form.dueDate} onChange={set("dueDate")} /></div>
                <div><p className="text-[12px] font-semibold opacity-50 mb-1 ml-1">Max points</p>
                  <input type="number" min="1" className="input w-full" value={form.maxPoints} onChange={set("maxPoints")} /></div>
                <div className="sm:col-span-2"><p className="text-[12px] font-semibold opacity-50 mb-1 ml-1">Assign to</p>
                  <select className="select w-full" value={form.assignedTo} onChange={set("assignedTo")}>
                    {YEARS.map((y) => <option key={y} value={y}>{y === "All" ? "All students" : `${y}s`}</option>)}
                  </select></div>
                <textarea className="textarea w-full min-h-24 sm:col-span-2" value={form.description} onChange={set("description")}
                  placeholder="Instructions — what students need to do, and how it will be graded." />

                <div className="sm:col-span-2">
                  <p className="text-[12px] font-semibold opacity-50 ml-1 mb-1.5">Resources <span className="font-normal">(optional)</span></p>
                  {form.resources.length === 0 && <p className="text-[12px] opacity-40 ml-1 mb-2">Attach files (briefs, exam papers, slides) or links students can open.</p>}

                  {form.resources.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {form.resources.map((r, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-2xl bg-base-200 px-3.5 py-2.5">
                          {r.kind === "file" ? <IcFile width={18} height={18} className="text-primary shrink-0" /> : <IcLink width={18} height={18} className="text-primary shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium truncate">{r.kind === "file" ? r.name : (r.label || r.url)}</p>
                            <p className="text-[12px] opacity-45 truncate">{r.kind === "file" ? prettySize(r.size) : r.url}</p>
                          </div>
                          {(r.fileId || r.kind === "link") && (
                            <button type="button" onClick={() => openAttachment(r)} className="btn btn-ghost btn-xs btn-circle" title={r.kind === "file" ? "Download" : "Open"}>
                              {r.kind === "file" ? <IcDownload width={16} height={16} /> : <IcArrow width={16} height={16} />}
                            </button>
                          )}
                          <button type="button" onClick={() => removeResource(i)} className="btn btn-ghost btn-xs btn-circle text-[#d70015]" title="Remove"><IcTrash width={15} height={15} /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <input ref={fileInput} type="file" multiple className="hidden" onChange={onPickFiles} />
                    <button type="button" className="btn btn-sm btn-outline border-base-content/15" onClick={() => fileInput.current?.click()} disabled={uploading}>
                      {uploading ? <span className="loading loading-spinner loading-xs" /> : <IcFile width={16} height={16} />} Add file
                    </button>
                    <span className="text-[12px] opacity-40">Up to 4MB each</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <input className="input flex-1" placeholder="Label (optional)" value={linkDraft.label} onChange={(e) => setLinkDraft({ ...linkDraft, label: e.target.value })} />
                    <input className="input flex-[1.4]" placeholder="https://…" value={linkDraft.url}
                      onChange={(e) => setLinkDraft({ ...linkDraft, url: e.target.value })} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResourceLink())} />
                    <button type="button" className="btn btn-sm btn-outline border-base-content/15" onClick={addResourceLink} disabled={!linkDraft.url.trim()}>
                      <IcPlus width={16} height={16} /> Add link
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-5">
                <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary px-6" onClick={create} disabled={busy}>
                  {busy ? <span className="loading loading-spinner loading-sm" /> : "Publish assignment"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
