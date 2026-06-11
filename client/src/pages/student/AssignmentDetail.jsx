import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client.js";
import { uploadFile, openAttachment, prettySize } from "../../api/files.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { IcArrow, IcLink, IcFile, IcDownload, IcTrash, IcPlus } from "../../components/Icons.jsx";

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const fileInput = useRef(null);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [content, setContent] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [linkDraft, setLinkDraft] = useState({ label: "", url: "" });
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const load = () =>
    api.get(`/api/assignments/${id}`).then((res) => {
      setData(res.data);
      setContent(res.data.submission?.content || "");
      setStudentNote(res.data.submission?.studentNote || "");
      setAttachments(res.data.submission?.attachments || []);
      setLoadError("");
    });

  useEffect(() => {
    setData(null); setLoadError("");
    load().catch((err) => setLoadError(err.response?.data?.message || "Could not load this assignment. It may have been removed."));
  }, [id]);

  if (loadError) {
    return (
      <div className="px-4 sm:px-8 py-7 max-w-3xl mx-auto">
        <Link to="/student/assignments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:underline mb-4">
          <IcArrow width={16} height={16} className="rotate-180" /> Assignments
        </Link>
        <div className="surface p-8 text-center">
          <p className="font-semibold text-[16px]">Couldn't open this assignment</p>
          <p className="text-[13px] opacity-50 mt-1">{loadError}</p>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => load().catch((e) => setLoadError(e.response?.data?.message || "Still couldn't load it."))}>Try again</button>
        </div>
      </div>
    );
  }
  if (!data) return <div className="grid place-items-center py-32"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  const sub = data.submission;
  const submitted = sub?.status === "submitted" || sub?.status === "late";
  const pastDue = new Date(data.dueDate) < new Date();
  const status = submitted ? sub.status : pastDue ? "overdue" : "not_submitted";
  const resources = data.resources || [];

  const onPickFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    setUploading(true); setMessage(null);
    try {
      for (const f of files) {
        const ref = await uploadFile(f);
        setAttachments((prev) => [...prev, ref]);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || err.message || "Upload failed." });
    } finally { setUploading(false); }
  };
  const addLink = () => {
    if (!linkDraft.url.trim()) return;
    setAttachments((prev) => [...prev, { kind: "link", label: linkDraft.label.trim(), url: linkDraft.url.trim() }]);
    setLinkDraft({ label: "", url: "" });
  };
  const removeAttachment = (i) => setAttachments((prev) => prev.filter((_, idx) => idx !== i));

  const hasAnswer = content.trim() || attachments.length > 0;

  const submitWork = async () => {
    setBusy(true); setMessage(null);
    try { await api.post(`/api/submissions/${id}/submit`, { content, studentNote, attachments }); await load(); setMessage({ type: "success", text: "Work submitted." }); }
    catch (err) { setMessage({ type: "error", text: err.response?.data?.message || "Could not submit your work." }); }
    finally { setBusy(false); }
  };
  const saveNote = async () => {
    setBusy(true); setMessage(null);
    try { await api.put(`/api/submissions/${id}/student-note`, { studentNote }); setMessage({ type: "success", text: "Note saved." }); }
    catch (err) { setMessage({ type: "error", text: err.response?.data?.message || "Could not save your note." }); }
    finally { setBusy(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 sm:px-8 py-7 max-w-3xl mx-auto">
      <Link to="/student/assignments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:underline mb-4">
        <IcArrow width={16} height={16} className="rotate-180" /> Assignments
      </Link>

      <div className="surface p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-40">{data.type} · {data.course}</p>
            <h1 className="text-[26px] sm:text-[30px] font-bold leading-tight mt-1">{data.title}</h1>
            <p className="text-[14px] opacity-50 mt-1.5">
              {data.instructor?.name} · Due {new Date(data.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {data.maxPoints} pts
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
        {data.description && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">{data.description}</p>}

        {resources.length > 0 && (
          <div className="mt-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide opacity-40 mb-2">Resources from your instructor</p>
            <div className="flex flex-wrap gap-2">
              {resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3.5 py-2 text-[13px] font-semibold hover:bg-primary/15 transition-colors">
                  <IcLink width={15} height={15} /> {r.label || r.url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {sub?.grade != null && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface p-6 mt-4 bg-gradient-to-b from-primary/[0.06] to-transparent">
          <p className="text-[12px] font-semibold uppercase tracking-wide opacity-40">Your grade</p>
          <p className="text-[44px] font-bold text-primary leading-tight mt-1">
            {sub.grade}<span className="text-[20px] opacity-40 font-semibold">/{data.maxPoints}</span>
            <span className="text-[18px] ml-3 opacity-60 font-semibold">{Math.round((sub.grade / data.maxPoints) * 100)}%</span>
          </p>
          {sub.instructorNote && (
            <div className="mt-3 pt-3 border-t border-base-content/10">
              <p className="text-[12px] font-semibold uppercase tracking-wide opacity-40">Instructor's note</p>
              <p className="text-[14px] mt-1.5 whitespace-pre-wrap leading-relaxed">{sub.instructorNote}</p>
            </div>
          )}
        </motion.div>
      )}

      <div className="surface p-6 sm:p-7 mt-4">
        <h2 className="font-bold text-[18px]">{submitted ? "Your submission" : "Submit your work"}</h2>
        {submitted && (
          <p className="text-[12px] opacity-50 mt-0.5">
            Submitted {new Date(sub.submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            {sub.status === "late" && <span className="text-[#b36800] font-semibold"> · after the due date</span>}
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-[13px] font-semibold mb-1.5">Written answer <span className="opacity-40 font-normal">(optional)</span></p>
            <textarea className="textarea w-full min-h-24 text-[15px]" value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Type your answer here, or just attach files / links below." />
          </div>

          <div>
            <p className="text-[13px] font-semibold mb-2">Files &amp; links</p>
            {attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl bg-base-200 px-3.5 py-2.5">
                    {a.kind === "file" ? <IcFile width={18} height={18} className="text-primary shrink-0" /> : <IcLink width={18} height={18} className="text-primary shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium truncate">{a.kind === "file" ? a.name : (a.label || a.url)}</p>
                      <p className="text-[12px] opacity-45 truncate">{a.kind === "file" ? prettySize(a.size) : a.url}</p>
                    </div>
                    {(a.fileId || a.kind === "link") && (
                      <button onClick={() => openAttachment(a)} className="btn btn-ghost btn-xs btn-circle" title={a.kind === "file" ? "Download" : "Open"}>
                        {a.kind === "file" ? <IcDownload width={16} height={16} /> : <IcArrow width={16} height={16} />}
                      </button>
                    )}
                    <button onClick={() => removeAttachment(i)} className="btn btn-ghost btn-xs btn-circle text-[#d70015]" title="Remove"><IcTrash width={15} height={15} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <input ref={fileInput} type="file" multiple className="hidden" onChange={onPickFiles} />
              <button className="btn btn-sm btn-outline border-base-content/15" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? <span className="loading loading-spinner loading-xs" /> : <IcFile width={16} height={16} />} Add file
              </button>
              <span className="text-[12px] opacity-40">Up to 4MB each</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input className="input flex-1" placeholder="Label (optional)" value={linkDraft.label} onChange={(e) => setLinkDraft({ ...linkDraft, label: e.target.value })} />
              <input className="input flex-[1.4]" placeholder="Paste a link (Drive, GitHub…)" value={linkDraft.url}
                onChange={(e) => setLinkDraft({ ...linkDraft, url: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addLink()} />
              <button className="btn btn-sm btn-outline border-base-content/15" onClick={addLink} disabled={!linkDraft.url.trim()}>
                <IcPlus width={16} height={16} /> Add link
              </button>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold mb-1.5">Your note to the instructor <span className="opacity-40 font-normal">(optional)</span></p>
            <textarea className="textarea w-full min-h-20 text-[15px]" value={studentNote} onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Anything that helps evaluate your work — what was hard, what you'd improve, questions you have." />
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className={`text-[13px] font-medium rounded-xl px-3 py-2 mt-3 overflow-hidden ${message.type === "success" ? "text-[#1d8a3c] bg-[#34c759]/10" : "text-[#d70015] bg-[#ff3b30]/10"}`}>{message.text}</motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 mt-5">
          <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary px-6" onClick={submitWork} disabled={busy || uploading || !hasAnswer}>
            {busy ? <span className="loading loading-spinner loading-sm" /> : submitted ? "Resubmit work" : "Submit work"}
          </motion.button>
          {submitted && <motion.button whileTap={{ scale: 0.97 }} className="btn btn-ghost" onClick={saveNote} disabled={busy}>Save note only</motion.button>}
        </div>
        {!submitted && pastDue && <p className="text-[12px] text-[#b36800] font-medium mt-2">The due date has passed — your submission will be marked late.</p>}
      </div>
    </motion.div>
  );
}
