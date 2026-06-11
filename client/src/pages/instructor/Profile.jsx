import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/Page.jsx";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-base-content/[0.06] last:border-0">
      <span className="text-[13px] opacity-50">{label}</span>
      <span className="text-[14px] font-semibold">{value || "—"}</span>
    </div>
  );
}

export default function InstructorProfile() {
  const { user } = useAuth();
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="px-4 sm:px-8 py-7 max-w-3xl mx-auto">
      <PageHeader title="Profile" subtitle="Your instructor information" />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="surface p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3694f1] to-[#0a84ff] grid place-items-center shadow-lg">
            <span className="text-[22px] font-bold text-white">{initials}</span>
          </div>
          <div>
            <h2 className="text-[22px] font-bold">{user.name}</h2>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-primary/10 text-primary mt-1">Instructor</span>
          </div>
        </div>
        <div className="mt-6">
          <Row label="Full name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Instructor ID" value={user.uid} />
          <Row label="Role" value="Instructor" />
          <Row label="Department" value={user.department} />
        </div>
      </motion.div>
    </div>
  );
}
