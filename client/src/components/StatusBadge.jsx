const STYLES = {
  submitted:     { label: "Submitted",     cls: "bg-[#34c759]/15 text-[#1d8a3c]" },
  late:          { label: "Late",          cls: "bg-[#ff9500]/15 text-[#b36800]" },
  not_submitted: { label: "Not submitted", cls: "bg-base-content/[0.08] text-base-content/50" },
  overdue:       { label: "Overdue",       cls: "bg-[#ff3b30]/15 text-[#d70015]" },
  graded:        { label: "Graded",        cls: "bg-[#0071e3]/12 text-[#0071e3]" },
};
export default function StatusBadge({ status }) {
  const s = STYLES[status] || STYLES.not_submitted;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap ${s.cls}`}>{s.label}</span>;
}
